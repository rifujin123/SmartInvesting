using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Repositories;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser<Guid>> userManager;
        private readonly RoleManager<IdentityRole<Guid>> roleManager;
        private readonly ITokenRepository tokenRepository;

        public AuthController(UserManager<IdentityUser<Guid>> userManager,RoleManager<IdentityRole<Guid>> roleManager,ITokenRepository tokenRepository)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
            this.tokenRepository = tokenRepository;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            var user = new IdentityUser<Guid>
            {
                Email = request.Email,
                UserName = request.Username
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            const string defaultRole = "User";
            if (!await roleManager.RoleExistsAsync(defaultRole))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(defaultRole));
            }

            await userManager.AddToRoleAsync(user, defaultRole);

            return Ok("Đăng ký thành công!");
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await userManager.FindByNameAsync(request.Username);

            if (user == null)
                return Unauthorized("Username hoặc Password không đúng.");

            var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);

            if (!isPasswordValid)
                return Unauthorized("Username hoặc Password không đúng.");

            var roles = await userManager.GetRolesAsync(user);
            var jwtToken = tokenRepository.CreateToken(user, roles.ToList());

            return Ok(new { token = jwtToken });
        }
    }
}
