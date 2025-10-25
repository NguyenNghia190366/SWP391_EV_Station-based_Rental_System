namespace BusinessLogicLayer.DTOs.VehicleModels
{
    public class VehicleModelListQuery
    {
        // Rule 1.2: search (áp dụng cho brand + model name)
        public string? Search { get; set; } 
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Sort { get; set; } 
    }
}