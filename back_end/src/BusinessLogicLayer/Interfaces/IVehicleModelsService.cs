using BusinessLogicLayer.DTOs.VehicleModels;

namespace BusinessLogicLayer.Interfaces
{
    public interface IVehicleModelsService
    {
        Task<(IEnumerable<VehicleModelViewDto> data, int total)> GetPagedAsync(VehicleModelListQuery q);
        Task<VehicleModelViewDto?> GetByIdAsync(int id);
        Task<VehicleModelViewDto> CreateAsync(VehicleModelCreateDto dto);
        Task<bool> UpdateAsync(int id, VehicleModelUpdateDto dto);
        Task<bool> DeleteAsync(int id); 
    }
}