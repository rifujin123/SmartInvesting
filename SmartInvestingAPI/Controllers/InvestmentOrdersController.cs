using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Repositories;
using SmartInvestingAPI.Services;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/investment-orders")]
    [ApiController]
    [Authorize]
    public class InvestmentOrdersController : ControllerBase
    {
        private readonly IInvestmentOrderService investmentOrderService;
        private readonly IInvestmentOrderRepository investmentOrderRepository;
        private readonly IMapper mapper;

        public InvestmentOrdersController(
            IInvestmentOrderService investmentOrderService,
            IInvestmentOrderRepository investmentOrderRepository,
            IMapper mapper)
        {
            this.investmentOrderService = investmentOrderService;
            this.investmentOrderRepository = investmentOrderRepository;
            this.mapper = mapper;
        }

        //POST: /api/investment-orders
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddInvestmentOrderRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            try
            {
                InvestmentOrder order;
                if (request.OrderType == OrderType.Buy)
                {
                    order = await investmentOrderService.BuyAsync(
                        userId,
                        request.WalletId,
                        request.AssetId,
                        request.Quantity,
                        request.Price,
                        request.Fee,
                        request.OrderDate);
                }
                else
                {
                    order = await investmentOrderService.SellAsync(
                        userId,
                        request.WalletId,
                        request.AssetId,
                        request.Quantity,
                        request.Price,
                        request.Fee,
                        request.OrderDate);
                }

                var created = await investmentOrderRepository.GetByIdAsync(order.Id, userId);
                if (created == null)
                    return Problem("Order created but cannot be loaded.", statusCode: StatusCodes.Status500InternalServerError);

                var dto = mapper.Map<InvestmentOrderDto>(created);
                return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //GET: /api/investment-orders
        [HttpGet]
        public async Task<IActionResult> GetAllHistoryInvestmentOrder()
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var orders = await investmentOrderRepository.GetAllByUserAsync(userId);
            return Ok(mapper.Map<List<InvestmentOrderDto>>(orders));
        }

        //GET: /api/investment-orders/{id}
        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var order = await investmentOrderRepository.GetByIdAsync(id, userId);
            if (order == null)
                return NotFound();

            return Ok(mapper.Map<InvestmentOrderDto>(order));
        }
    }
}
