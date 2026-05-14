using Microsoft.AspNetCore.Http;

namespace SmartInvestingAPI.Services
{
    public interface IAvatarStorageService
    {
        Task<string> UploadAvatarAsync(Guid userId, IFormFile file);
    }
}