namespace SmartInvestingAPI.Model.Wrappers;

/// <summary>
/// Standard pagination request parameters
/// </summary>
public class PaginationParams
{
    private const int MaxPageSize = 100;
    private const int DefaultPageSize = 20;
    
    private int _pageSize = DefaultPageSize;
    private int _pageNumber = 1;

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? DefaultPageSize : (value > MaxPageSize ? MaxPageSize : value);
    }

    public int Skip => (PageNumber - 1) * PageSize;
}

/// <summary>
/// Standard paginated response wrapper
/// </summary>
/// <typeparam name="T">Type of items in the list</typeparam>
public class PagedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;
    public int? NextPage => HasNext ? PageNumber + 1 : null;
    public int? PreviousPage => HasPrevious ? PageNumber - 1 : null;

    public static PagedResponse<T> Create(List<T> items, int pageNumber, int pageSize, int totalCount)
    {
        return new PagedResponse<T>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public static PagedResponse<T> Empty(int pageNumber = 1, int pageSize = 20)
    {
        return new PagedResponse<T>
        {
            Items = new List<T>(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = 0
        };
    }
}
