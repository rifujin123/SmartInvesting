using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Model.Wrappers;
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

        private Guid? GetUserIdOrFail()
        {
            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(rawUserId, out var userId) ? userId : null;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddInvestmentOrderRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid order data"));

            var userId = GetUserIdOrFail();
            if (userId == null)
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            try
            {
                InvestmentOrder order;
                if (request.OrderType == OrderType.Buy)
                {
                    order = await investmentOrderService.BuyAsync(
                        userId.Value,
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
                        userId.Value,
                        request.WalletId,
                        request.AssetId,
                        request.Quantity,
                        request.Price,
                        request.Fee,
                        request.OrderDate);
                }

                var created = await investmentOrderRepository.GetByIdAsync(order.Id, userId.Value);
                if (created == null)
                    return Problem(detail: "Order created but cannot be loaded.", statusCode: StatusCodes.Status500InternalServerError);

                var dto = mapper.Map<InvestmentOrderDto>(created);
                return CreatedAtAction(nameof(GetById), new { id = dto.Id },
                    ApiResponse<InvestmentOrderDto>.Created(dto, "Order placed successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllHistoryInvestmentOrder()
        {
            var userId = GetUserIdOrFail();
            if (userId == null)
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var orders = await investmentOrderRepository.GetAllByUserAsync(userId.Value);
            return Ok(ApiResponse<List<InvestmentOrderDto>>.Ok(mapper.Map<List<InvestmentOrderDto>>(orders)));
        }

        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            var userId = GetUserIdOrFail();
            if (userId == null)
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var order = await investmentOrderRepository.GetByIdAsync(id, userId.Value);
            if (order == null)
                return NotFound(ApiResponse.Fail("Order not found"));

            return Ok(ApiResponse<InvestmentOrderDto>.Ok(mapper.Map<InvestmentOrderDto>(order)));
        }
    }
}
