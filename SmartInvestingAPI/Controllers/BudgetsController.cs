using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Repositories;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BudgetsController : ControllerBase
    {
        private readonly IBudgetRepository budgetRepository;
        private readonly IMapper mapper;
        private readonly ITransactionRepository transactionRepository;

        public BudgetsController(IBudgetRepository budgetRepository, IMapper mapper, ITransactionRepository transactionRepository)
        {
            this.budgetRepository = budgetRepository;
            this.mapper = mapper;
            this.transactionRepository = transactionRepository;
        }

        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var budgets = await budgetRepository.GetAllByUserIdAsync(CurrentUserId);
            return Ok(mapper.Map<List<BudgetDto>>(budgets));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var budget = await budgetRepository.GetByIdAndUserAsync(id, CurrentUserId);
            if (budget == null)
                return NotFound();

            return Ok(mapper.Map<BudgetDto>(budget));
        }

        [HttpGet("{id:int}/summary")]
        public async Task<IActionResult> GetSummary([FromRoute] int id)
        {
            var budget = await budgetRepository.GetByIdAndUserAsync(id, CurrentUserId);
            if (budget == null)
                return NotFound();

            var totalSpent = await transactionRepository.GetTotalSpentByUserForCategoryMonthAsync(
                CurrentUserId,
                budget.CategoryId,
                budget.Month,
                budget.Year);

            var remaining = budget.AmountLimit - totalSpent;

            var summary = mapper.Map<BudgetSummaryDto>(budget);
            summary.TotalSpent = totalSpent;
            summary.Remaining = remaining;

            return Ok(summary);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddBudgetRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var budget = mapper.Map<Budget>(request);
            budget.UserId = CurrentUserId;
            budget.CreatedAt = DateTime.UtcNow;
            budget.IsActive = true;

            var created = await budgetRepository.CreateAsync(budget);
            var reloaded = await budgetRepository.GetByIdAndUserAsync(created.Id, CurrentUserId);
            var dto = mapper.Map<BudgetDto>(reloaded ?? created);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateBudgetRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await budgetRepository.GetByIdAndUserAsync(id, CurrentUserId);
            if (existing == null)
                return NotFound();

            mapper.Map(request, existing);

            var updated = await budgetRepository.UpdateAsync(existing);
            if (updated == null)
                return NotFound();

            var withNav = await budgetRepository.GetByIdAndUserAsync(updated.Id, CurrentUserId);
            return Ok(mapper.Map<BudgetDto>(withNav ?? updated));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var deleted = await budgetRepository.DeleteAsync(id, CurrentUserId);
            if (deleted == null)
                return NotFound();

            return Ok(mapper.Map<BudgetDto>(deleted));
        }
    }
}
