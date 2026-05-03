using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartInvestingAPI.Migrations
{
    /// <inheritdoc />
    public partial class Budget_UniquePerUserCategoryMonthYear : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Budgets_UserId_CategoryId_Month_Year",
                table: "Budgets",
                columns: new[] { "UserId", "CategoryId", "Month", "Year" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Budgets_UserId_CategoryId_Month_Year",
                table: "Budgets");
        }
    }
}
