using System.ComponentModel.DataAnnotations.Schema;
using AutoMapper;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;

namespace SmartInvestingAPI.Profiles
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<Wallet, WalletDto>().ReverseMap();
            CreateMap<Wallet, DashboardWalletRowDto>();

            CreateMap<Transaction, TransactionDto>()
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.CategoryType,
                    opt => opt.MapFrom(src => (int)src.Category.Type))
                .ForMember(dest => dest.CategoryIcon,
                    opt => opt.MapFrom(src => src.Category.Icon))
                .ForMember(dest => dest.AssetName,
                    opt => opt.MapFrom(src => src.Asset != null ? src.Asset.AssetName : string.Empty));

            CreateMap<AddTransactionRequestDto, Transaction>()
                .ForMember(dest => dest.AssetId,
                    opt => opt.MapFrom(src => src.AssetId));

            CreateMap<UpdateTransactionRequestDto, Transaction>()
                .ForMember(dest => dest.AssetId,
                    opt => opt.MapFrom(src => src.AssetId));

            CreateMap<Category, CategoryDto>().ReverseMap();
            CreateMap<AddCategoryRequestDto, Category>();
            CreateMap<UpdateCategoryRequestDto, Category>();

            CreateMap<Budget, BudgetDto>()
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.CategoryType,
                    opt => opt.MapFrom(src => src.Category.Type));

            CreateMap<Budget, BudgetSummaryDto>()
                .ForMember(dest => dest.BudgetId,
                    opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.CategoryType,
                    opt => opt.MapFrom(src => src.Category.Type))
                .ForMember(dest => dest.TotalSpent,
                    opt => opt.Ignore())
                .ForMember(dest => dest.Remaining,
                    opt => opt.Ignore());

            CreateMap<AddBudgetRequestDto, Budget>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore());
            CreateMap<UpdateBudgetRequestDto, Budget>();

            CreateMap<Asset, AssetDto>().ReverseMap();
            CreateMap<AddAssetRequestDto, Asset>()
                .ForMember(dest => dest.CurrentPrice, opt => opt.Ignore())
                .ReverseMap();
            CreateMap<UpdateAssetRequestDto, Asset>();
            CreateMap<Portfolio, PortfolioDto>()
                .ForMember(dest => dest.Ticker,
                    opt => opt.MapFrom(src => src.Asset.Ticker))
                .ForMember(dest => dest.AssetName,
                    opt => opt.MapFrom(src => src.Asset.AssetName))
                .ForMember(dest => dest.AssetType,
                    opt => opt.MapFrom(src => src.Asset.Type.ToString()))
                .ForMember(dest => dest.CurrentPrice,
                    opt => opt.MapFrom(src => src.Asset.CurrentPrice));
            CreateMap<AddInvestmentOrderRequestDto, InvestmentOrder>()
                .ForMember(dest => dest.RealizedProfitLoss, opt => opt.Ignore());

            CreateMap<InvestmentOrder, InvestmentOrderDto>()
                .ForMember(dest => dest.AssetTicker,
                    opt => opt.MapFrom(src => src.Portfolio.Asset.Ticker))
                .ForMember(dest => dest.AssetName,
                    opt => opt.MapFrom(src => src.Portfolio.Asset.AssetName))
                .ForMember(dest => dest.AssetType,
                    opt => opt.MapFrom(src => src.Portfolio.Asset.Type.ToString()));

            CreateMap<IncomeEvent, IncomeEventDto>()
                .ForMember(dest => dest.AssetTicker,
                    opt => opt.MapFrom(src => src.Asset != null ? src.Asset.Ticker : null))
                .ForMember(dest => dest.AssetName,
                    opt => opt.MapFrom(src => src.Asset != null ? src.Asset.AssetName : null));
        }
    }
}
