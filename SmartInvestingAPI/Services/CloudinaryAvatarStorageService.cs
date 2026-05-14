using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace SmartInvestingAPI.Services
{
    public class CloudinaryAvatarStorageService : IAvatarStorageService
    {
        private const long MaxFileSizeBytes = 5 * 1024 * 1024;
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        private readonly Cloudinary cloudinary;
        private readonly ILogger<CloudinaryAvatarStorageService> logger;

        public CloudinaryAvatarStorageService(Cloudinary cloudinary, ILogger<CloudinaryAvatarStorageService> logger)
        {
            this.cloudinary = cloudinary;
            this.logger = logger;
        }

        public async Task<string> UploadAvatarAsync(Guid userId, IFormFile file)
        {
            if (file.Length == 0)
                throw new ArgumentException("Avatar file is required.", nameof(file));

            if (file.Length > MaxFileSizeBytes)
                throw new ArgumentException("Avatar image must be 5 MB or smaller.", nameof(file));

            if (!AllowedContentTypes.Contains(file.ContentType))
                throw new ArgumentException("Avatar must be a JPEG, PNG, or WebP image.", nameof(file));

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "smart-investing/avatars",
                PublicId = $"user-{userId}",
                Overwrite = true,
                Transformation = new Transformation()
                    .Width(512)
                    .Height(512)
                    .Crop("fill")
                    .Gravity("face")
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var result = await cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
            {
                logger.LogError(
                    "Cloudinary avatar upload failed for user {UserId}: {Error}",
                    userId,
                    result.Error.Message);
                throw new InvalidOperationException(result.Error.Message);
            }

            logger.LogInformation(
                "Cloudinary avatar uploaded for user {UserId}. PublicId: {PublicId}. SecureUrl: {SecureUrl}",
                userId,
                result.PublicId,
                result.SecureUrl);

            return result.SecureUrl?.ToString()
                ?? throw new InvalidOperationException("Cloudinary upload did not return a secure URL.");
        }
    }
}