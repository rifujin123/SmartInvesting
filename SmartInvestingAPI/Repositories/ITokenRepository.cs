using Microsoft.AspNetCore.Identity;

namespace SmartInvestingAPI.Repositories
{
    public interface ITokenRepository
    {
        string CreateToken(IdentityUser<Guid> user, List<string> roles);
    }
}
