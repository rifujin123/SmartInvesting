using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Database
{

    public class AppIdentityDbcontext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public AppIdentityDbcontext(DbContextOptions<AppIdentityDbcontext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }
    }
}
