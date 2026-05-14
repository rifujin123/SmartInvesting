using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Model.Wrappers;
using SmartInvestingAPI.Services;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<User> userManager;
        private readonly IAvatarStorageService avatarStorageService;

        public ProfileController(UserManager<User> userManager, IAvatarStorageService avatarStorageService)
        {
            this.userManager = userManager;
            this.avatarStorageService = avatarStorageService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var user = await GetCurrentUserAsync();
            if (user == null)
                return Unauthorized(ApiResponse.Fail("Invalid user context."));

            return Ok(ApiResponse<ProfileDto>.Ok(ToDto(user)));
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail(GetModelStateErrors()));

            var user = await GetCurrentUserAsync();
            if (user == null)
                return Unauthorized(ApiResponse.Fail("Invalid user context."));

            var username = request.UserName.Trim();
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest(ApiResponse.Fail("Username is required."));

            var existingUsername = await userManager.FindByNameAsync(username);
            if (existingUsername != null && existingUsername.Id != user.Id)
                return BadRequest(ApiResponse.Fail("Username already taken."));

            user.FirstName = NormalizeOptional(request.FirstName);
            user.LastName = NormalizeOptional(request.LastName);
            user.AvatarUrl = NormalizeOptional(request.AvatarUrl);

            if (!string.Equals(user.UserName, username, StringComparison.Ordinal))
            {
                var usernameResult = await userManager.SetUserNameAsync(user, username);
                if (!usernameResult.Succeeded)
                    return BadRequest(ApiResponse<object>.Fail(usernameResult.Errors.Select(e => e.Description).ToList()));
            }

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(ApiResponse<object>.Fail(result.Errors.Select(e => e.Description).ToList()));

            return Ok(ApiResponse<ProfileDto>.Ok(ToDto(user), "Profile updated successfully."));
        }

        [HttpPut("email")]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail(GetModelStateErrors()));

            var user = await GetCurrentUserAsync();
            if (user == null)
                return Unauthorized(ApiResponse.Fail("Invalid user context."));

            var email = request.NewEmail.Trim();
            var existingEmail = await userManager.FindByEmailAsync(email);
            if (existingEmail != null && existingEmail.Id != user.Id)
                return BadRequest(ApiResponse.Fail("Email already registered."));

            var emailResult = await userManager.SetEmailAsync(user, email);
            if (!emailResult.Succeeded)
                return BadRequest(ApiResponse<object>.Fail(emailResult.Errors.Select(e => e.Description).ToList()));

            user.EmailConfirmed = false;
            var updateResult = await userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return BadRequest(ApiResponse<object>.Fail(updateResult.Errors.Select(e => e.Description).ToList()));

            return Ok(ApiResponse<ProfileDto>.Ok(ToDto(user), "Email updated successfully."));
        }

        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail(GetModelStateErrors()));

            var user = await GetCurrentUserAsync();
            if (user == null)
                return Unauthorized(ApiResponse.Fail("Invalid user context."));

            var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
                return BadRequest(ApiResponse<object>.Fail(result.Errors.Select(e => e.Description).ToList()));

            return Ok(ApiResponse.Ok("Password changed successfully."));
        }

        [HttpPost("me/avatar")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        public async Task<IActionResult> UploadAvatar(IFormFile? file)
        {
            if (file == null)
                return BadRequest(ApiResponse.Fail("Avatar file is required."));

            var user = await GetCurrentUserAsync();
            if (user == null)
                return Unauthorized(ApiResponse.Fail("Invalid user context."));

            try
            {
                user.AvatarUrl = await avatarStorageService.UploadAvatarAsync(user.Id, file);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
            catch (InvalidOperationException)
            {
                return StatusCode(StatusCodes.Status502BadGateway, ApiResponse.Fail("Avatar upload failed. Please try again."));
            }

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(ApiResponse<object>.Fail(result.Errors.Select(e => e.Description).ToList()));

            return Ok(ApiResponse<ProfileDto>.Ok(ToDto(user), "Avatar updated successfully."));
        }

        private async Task<User?> GetCurrentUserAsync()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userIdClaim, out var userId)
                ? await userManager.FindByIdAsync(userId.ToString())
                : null;
        }

        private static ProfileDto ToDto(User user)
        {
            return new ProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                RiskProfile = user.RiskProfile
            };
        }

        private static string? NormalizeOptional(string? value)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
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
