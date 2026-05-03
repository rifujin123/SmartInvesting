using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartInvestingAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddWalletIsPaper : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPaper",
                table: "Wallets",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPaper",
                table: "Wallets");
        }
    }
}
