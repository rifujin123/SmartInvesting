using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartInvestingAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddWalletRowVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Wallets",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CategoryId_TransactionDate",
                table: "Transactions",
                columns: new[] { "CategoryId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TransactionDate",
                table: "Transactions",
                column: "TransactionDate");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_WalletId_TransactionDate",
                table: "Transactions",
                columns: new[] { "WalletId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Portfolios_UserId",
                table: "Portfolios",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Portfolios_UserId_AssetId",
                table: "Portfolios",
                columns: new[] { "UserId", "AssetId" });

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentOrders_OrderDate",
                table: "InvestmentOrders",
                column: "OrderDate");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentOrders_WalletId_OrderDate",
                table: "InvestmentOrders",
                columns: new[] { "WalletId", "OrderDate" });

            migrationBuilder.CreateIndex(
                name: "IX_IncomeEvents_EventDate",
                table: "IncomeEvents",
                column: "EventDate");

            migrationBuilder.CreateIndex(
                name: "IX_IncomeEvents_WalletId_EventDate",
                table: "IncomeEvents",
                columns: new[] { "WalletId", "EventDate" });

            migrationBuilder.CreateIndex(
                name: "IX_AssetsPricesHistory_AssetId_RecordedAt",
                table: "AssetsPricesHistory",
                columns: new[] { "AssetId", "RecordedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AssetsPricesHistory_RecordedAt",
                table: "AssetsPricesHistory",
                column: "RecordedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transactions_CategoryId_TransactionDate",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_TransactionDate",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_WalletId_TransactionDate",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Portfolios_UserId",
                table: "Portfolios");

            migrationBuilder.DropIndex(
                name: "IX_Portfolios_UserId_AssetId",
                table: "Portfolios");

            migrationBuilder.DropIndex(
                name: "IX_InvestmentOrders_OrderDate",
                table: "InvestmentOrders");

            migrationBuilder.DropIndex(
                name: "IX_InvestmentOrders_WalletId_OrderDate",
                table: "InvestmentOrders");

            migrationBuilder.DropIndex(
                name: "IX_IncomeEvents_EventDate",
                table: "IncomeEvents");

            migrationBuilder.DropIndex(
                name: "IX_IncomeEvents_WalletId_EventDate",
                table: "IncomeEvents");

            migrationBuilder.DropIndex(
                name: "IX_AssetsPricesHistory_AssetId_RecordedAt",
                table: "AssetsPricesHistory");

            migrationBuilder.DropIndex(
                name: "IX_AssetsPricesHistory_RecordedAt",
                table: "AssetsPricesHistory");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Wallets");
        }
    }
}
