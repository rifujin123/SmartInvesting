using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Repositories;

namespace SmartInvestingAPI.Controllers
{
    // Route: /api/wallets
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
        public async Task<IActionResult> GetMyWallets()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallets = await walletRepository.GetAllByUserIdAsync(userId);

            if (wallets == null)
                return NotFound();

            return Ok(mapper.Map<List<WalletDto>>(wallets));
        }

        // GET: api/wallets/{id}
        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> GetWalletById([FromRoute] Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await walletRepository.GetByIdAsync(id);

            if (wallet == null || wallet.UserId != userId)
                return NotFound();
            return Ok(mapper.Map<WalletDto>(wallet));
        }

        // POST: api/wallets
        [HttpPost]
        public async Task<IActionResult> CreateWallet([FromBody] AddWalletRequestDto request)
        {
            var wallet = new Wallet
            {
                Name = request.Name,
                Balance = request.Balance,
                Currency = request.Currency,
                IsPaper = request.IsPaper,
                UserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            await walletRepository.CreateAsync(wallet);
            return CreatedAtAction(nameof(GetWalletById),new { id = wallet.Id }, mapper.Map<WalletDto>(wallet));
        }

        // DELETE: api/wallets/{id}
        [HttpDelete("{id:Guid}")]
        public async Task<IActionResult> DisableWallet([FromRoute] Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await walletRepository.GetByIdAsync(id);

            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            await walletRepository.DeleteAsync(id);
            return Ok(mapper.Map<WalletDto>(wallet));
        }
    }
}
