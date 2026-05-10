using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Model.Wrappers;
using SmartInvestingAPI.Repositories;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser<Guid>> userManager;
        private readonly SignInManager<IdentityUser<Guid>> signInManager;
        private readonly RoleManager<IdentityRole<Guid>> roleManager;
        private readonly ITokenRepository tokenRepository;
        private readonly IRefreshTokenRepository refreshTokenRepository;

        public AuthController(
            UserManager<IdentityUser<Guid>> userManager,
            SignInManager<IdentityUser<Guid>> signInManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            ITokenRepository tokenRepository,
            IRefreshTokenRepository refreshTokenRepository)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.roleManager = roleManager;
            this.tokenRepository = tokenRepository;
            this.refreshTokenRepository = refreshTokenRepository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail(GetModelStateErrors()));

            var existingUser = await userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest(ApiResponse.Fail("Email already registered"));
            }

            var existingUsername = await userManager.FindByNameAsync(request.Username);
            if (existingUsername != null)
            {
                return BadRequest(ApiResponse.Fail("Username already taken"));
            }

            var user = new IdentityUser<Guid>
            {
                Email = request.Email,
                UserName = request.Username
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(ApiResponse<object>.Fail(errors));
            }

            const string defaultRole = "User";
            if (!await roleManager.RoleExistsAsync(defaultRole))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(defaultRole));
            }

            await userManager.AddToRoleAsync(user, defaultRole);

            return Ok(ApiResponse<object>.Ok(new { userId = user.Id, email = user.Email }, "Registration successful"));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail(GetModelStateErrors()));

            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return Unauthorized(ApiResponse.Fail("Invalid email or password"));

            var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

            if (result.IsLockedOut)
                return Unauthorized(ApiResponse.Fail("Account is locked out. Please try again later."));

            if (!result.Succeeded)
                return Unauthorized(ApiResponse.Fail("Invalid email or password"));

            var roles = await userManager.GetRolesAsync(user);
            var (token, expiresAt) = tokenRepository.CreateToken(user, roles.ToList());

            // Create refresh token
            var deviceInfo = Request.Headers["User-Agent"].FirstOrDefault();
            var refreshToken = tokenRepository.CreateRefreshToken(user.Id, deviceInfo);
            await refreshTokenRepository.CreateAsync(refreshToken);

            return Ok(ApiResponse<TokenResponseDto>.Ok(new TokenResponseDto
            {
                Token = token,
                RefreshToken = refreshToken.Token,
                ExpiresAt = expiresAt,
                ExpiresInSeconds = (int)(expiresAt - DateTime.UtcNow).TotalSeconds
            }));
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail(GetModelStateErrors()));

            var storedToken = await refreshTokenRepository.GetByTokenAsync(request.RefreshToken);
            if (storedToken == null || !storedToken.IsActive)
                return Unauthorized(ApiResponse.Fail("Invalid or expired refresh token."));

            var user = await userManager.FindByIdAsync(storedToken.UserId.ToString());
            if (user == null)
                return Unauthorized(ApiResponse.Fail("User not found."));

            // Revoke old refresh token (rotation)
            await refreshTokenRepository.RevokeAsync(request.RefreshToken);

            // Generate new tokens
            var roles = await userManager.GetRolesAsync(user);
            var (newToken, expiresAt) = tokenRepository.CreateToken(user, roles.ToList());

            // Create new refresh token
            var deviceInfo = Request.Headers["User-Agent"].FirstOrDefault();
            var newRefreshToken = tokenRepository.CreateRefreshToken(user.Id, deviceInfo);
            await refreshTokenRepository.CreateAsync(newRefreshToken);

            return Ok(ApiResponse<TokenResponseDto>.Ok(new TokenResponseDto
            {
                Token = newToken,
                RefreshToken = newRefreshToken.Token,
                ExpiresAt = expiresAt,
                ExpiresInSeconds = (int)(expiresAt - DateTime.UtcNow).TotalSeconds
            }));
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto? request)
        {
            if (request != null && !string.IsNullOrEmpty(request.RefreshToken))
            {
                await refreshTokenRepository.RevokeAsync(request.RefreshToken);
            }

            return Ok(ApiResponse.Ok("Logged out successfully."));
        }

        private string GetModelStateErrors()
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return string.Join("; ", errors);
        }
    }
}
