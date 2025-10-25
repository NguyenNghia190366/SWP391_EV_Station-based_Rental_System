using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Vehicles;

namespace BusinessLogicLayer.Interfaces
{
    public interface IVehicleService
    {
        Task<(IEnumerable<VehicleViewDto> data, int total)> GetPagedAsync(VehicleListQuery q);
        Task<VehicleViewDto?> GetByIdAsync(int id);
        Task<VehicleViewDto> CreateAsync(VehicleCreateDto dto);
        Task<bool> UpdateStatusAsync(int id, VehicleStatusUpdateDto dto);
        Task<bool> UpdateLocationAsync(int id, VehicleLocationUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}