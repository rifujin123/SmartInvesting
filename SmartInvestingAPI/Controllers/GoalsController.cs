using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Model.Wrappers;
using SmartInvestingAPI.Repositories;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GoalsController : ControllerBase
    {
        private readonly IGoalRepository goalRepository;
        private readonly IMapper mapper;

        public GoalsController(IGoalRepository goalRepository, IMapper mapper)
        {
            this.goalRepository = goalRepository;
            this.mapper = mapper;
        }

        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var goals = await goalRepository.GetAllByUserIdAsync(CurrentUserId);
            return Ok(ApiResponse<List<GoalDto>>.Ok(mapper.Map<List<GoalDto>>(goals)));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var goal = await goalRepository.GetByIdAndUserAsync(id, CurrentUserId);
            if (goal == null)
                return NotFound(ApiResponse.Fail("Goal not found"));

            return Ok(ApiResponse<GoalDto>.Ok(mapper.Map<GoalDto>(goal)));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddGoalRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid goal data"));

            var goal = mapper.Map<Goal>(request);
            goal.UserId = CurrentUserId;
            goal.CreatedAt = DateTime.UtcNow;
            goal.IsActive = true;

            var created = await goalRepository.CreateAsync(goal);
            var dto = mapper.Map<GoalDto>(created);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, ApiResponse<GoalDto>.Created(dto));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateGoalRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid goal data"));

            var existing = await goalRepository.GetByIdAndUserAsync(id, CurrentUserId);
            if (existing == null)
                return NotFound(ApiResponse.Fail("Goal not found"));

            mapper.Map(request, existing);
            var updated = await goalRepository.UpdateAsync(existing);
            if (updated == null)
                return NotFound(ApiResponse.Fail("Goal not found"));

            return Ok(ApiResponse<GoalDto>.Ok(mapper.Map<GoalDto>(updated)));
        }

        [HttpPost("{id:int}/contributions")]
        public async Task<IActionResult> AddContribution([FromRoute] int id, [FromBody] AddGoalContributionRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid contribution data"));

            var updated = await goalRepository.AddContributionAsync(id, CurrentUserId, request.Amount);
            if (updated == null)
                return NotFound(ApiResponse.Fail("Goal not found"));

            return Ok(ApiResponse<GoalDto>.Ok(mapper.Map<GoalDto>(updated)));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var deleted = await goalRepository.DeleteAsync(id, CurrentUserId);
            if (deleted == null)
                return NotFound(ApiResponse.Fail("Goal not found"));

            return Ok(ApiResponse<GoalDto>.Ok(mapper.Map<GoalDto>(deleted), "Goal deleted successfully"));
        }
    }
}
