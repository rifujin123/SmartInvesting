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
    public class WalletsController : ControllerBase
    {
        private readonly IWalletRepository walletRepository;
        private readonly IMapper mapper;

        public WalletsController(IWalletRepository walletRepository, IMapper mapper)
        {
            this.walletRepository = walletRepository;
            this.mapper = mapper;
        }

        // GET: api/wallets
        [HttpGet]
        public async Task<IActionResult> GetMyWallets([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetUserIdOrFail();
            if (userId == null)
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var (wallets, totalCount) = await walletRepository.GetAllByUserIdAsync(userId.Value, page, pageSize);
            var dto = mapper.Map<List<WalletDto>>(wallets);

            var pagedResponse = PagedResponse<WalletDto>.Create(dto, page, pageSize, totalCount);
            return Ok(ApiResponse<PagedResponse<WalletDto>>.Ok(pagedResponse));
        }

        // GET: api/wallets/{id}
        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> GetWalletById([FromRoute] Guid id)
        {
            var userId = GetUserIdOrFail();
            if (userId == null)
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var wallet = await walletRepository.GetByIdAsync(id);

            if (wallet == null || wallet.UserId != userId)
                return NotFound(ApiResponse.Fail("Wallet not found"));

            return Ok(ApiResponse<WalletDto>.Ok(mapper.Map<WalletDto>(wallet)));
        }

        // POST: api/wallets
        [HttpPost]
        public async Task<IActionResult> CreateWallet([FromBody] AddWalletRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid request"));

            var userId = GetUserIdOrFail();
            if (userId == null)
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var wallet = new Wallet
            {
                Name = request.Name,
                Balance = request.Balance,
                Currency = request.Currency,
                IsPaper = request.IsPaper,
                UserId = userId.Value,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            await walletRepository.CreateAsync(wallet);
            return CreatedAtAction(nameof(GetWalletById), new { id = wallet.Id },
                ApiResponse<WalletDto>.Created(mapper.Map<WalletDto>(wallet)));
        }

        // DELETE: api/wallets/{id}
        [HttpDelete("{id:Guid}")]
        public async Task<IActionResult> DisableWallet([FromRoute] Guid id)
        {
            var userId = GetUserIdOrFail();
            if (userId == null)
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var wallet = await walletRepository.GetByIdAsync(id);

            if (wallet == null || wallet.UserId != userId)
                return NotFound(ApiResponse.Fail("Wallet not found"));

            await walletRepository.DeleteAsync(id);
            return Ok(ApiResponse<WalletDto>.Ok(mapper.Map<WalletDto>(wallet), "Wallet disabled successfully"));
        }

        private Guid? GetUserIdOrFail()
        {
            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(rawUserId, out var userId) ? userId : null;
        }
    }
}
