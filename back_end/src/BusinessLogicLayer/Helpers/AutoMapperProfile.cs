using AutoMapper;
using DataAccessLayer.Models;
using BusinessLogicLayer.DTOs.VehicleModels;
using BusinessLogicLayer.DTOs.Vehicles;

namespace BusinessLogicLayer.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // ========== VehicleModel ==========

            // Map Create DTO -> Entity
            CreateMap<VehicleModelCreateDto, Vehicle_Model>()
                .ForMember(dest => dest.brand_name, opt => opt.MapFrom(src => src.BrandName))
                .ForMember(dest => dest.model_name, opt => opt.MapFrom(src => src.ModelName))
                .ForMember(dest => dest.vehicle_color, opt => opt.MapFrom(src => src.VehicleColor))
                .ForMember(dest => dest.number_of_seats, opt => opt.MapFrom(src => src.NumberOfSeats))
                .ForMember(dest => dest.mileage, opt => opt.MapFrom(src => src.Mileage));

            // Map Update DTO -> Entity
            CreateMap<VehicleModelUpdateDto, Vehicle_Model>()
               .ForMember(dest => dest.brand_name, opt => opt.MapFrom(src => src.BrandName))
               .ForMember(dest => dest.model_name, opt => opt.MapFrom(src => src.ModelName))
               .ForMember(dest => dest.vehicle_color, opt => opt.MapFrom(src => src.VehicleColor))
               .ForMember(dest => dest.number_of_seats, opt => opt.MapFrom(src => src.NumberOfSeats))
               .ForMember(dest => dest.mileage, opt => opt.MapFrom(src => src.Mileage));

            // Map Entity -> View DTO (Dùng cho GetByIdAsync và GetPagedAsync)
            CreateMap<Vehicle_Model, VehicleModelViewDto>()
                .ForMember(dest => dest.VehicleModelId, opt => opt.MapFrom(src => src.vehicle_model_id))
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.brand_name))
                .ForMember(dest => dest.ModelName, opt => opt.MapFrom(src => src.model_name))
                .ForMember(dest => dest.VehicleColor, opt => opt.MapFrom(src => src.vehicle_color))
                .ForMember(dest => dest.NumberOfSeats, opt => opt.MapFrom(src => src.number_of_seats))
                .ForMember(dest => dest.Mileage, opt => opt.MapFrom(src => src.mileage))
                // Rule 1.2: Lấy VehiclesCount
                .ForMember(dest => dest.VehiclesCount, opt => opt.MapFrom(src => src.Vehicles.Count));


            // ==========  VEHICLE ==========

            // Map cho các DTO lồng nhau
            CreateMap<Vehicle_Model, VehicleModelNestedDto>()
                .ForMember(dest => dest.VehicleModelId, opt => opt.MapFrom(src => src.vehicle_model_id))
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.brand_name))
                .ForMember(dest => dest.ModelName, opt => opt.MapFrom(src => src.model_name))
                .ForMember(dest => dest.NumberOfSeats, opt => opt.MapFrom(src => src.number_of_seats));
            
            CreateMap<Station, StationNestedDto>()
                .ForMember(dest => dest.StationId, opt => opt.MapFrom(src => src.station_id))
                .ForMember(dest => dest.StationName, opt => opt.MapFrom(src => src.station_name))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.address));

            // 1. Map Create DTO -> Entity Vehicle
            CreateMap<VehicleCreateDto, Vehicle>()
                .ForMember(dest => dest.license_plate, opt => opt.MapFrom(src => src.LicensePlate))
                .ForMember(dest => dest.vehicle_model_id, opt => opt.MapFrom(src => src.VehicleModelId))
                .ForMember(dest => dest.station_id, opt => opt.MapFrom(src => src.StationId))
                .ForMember(dest => dest.release_year, opt => opt.MapFrom(src => src.ReleaseYear))
                .ForMember(dest => dest.battery_capacity, opt => opt.MapFrom(src => src.BatteryCapacity))
                .ForMember(dest => dest.current_mileage, opt => opt.MapFrom(src => src.CurrentMileage))
                .ForMember(dest => dest.img_car_url, opt => opt.MapFrom(src => src.ImgCarUrl))
                .ForMember(dest => dest.condition, opt => opt.MapFrom(src => src.Condition));
            
            // 2. Map Entity Vehicle -> View DTO
            CreateMap<Vehicle, VehicleViewDto>()
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src => src.vehicle_id))
                .ForMember(dest => dest.LicensePlate, opt => opt.MapFrom(src => src.license_plate))
                .ForMember(dest => dest.ImgCarUrl, opt => opt.MapFrom(src => src.img_car_url))
                .ForMember(dest => dest.IsAvailable, opt => opt.MapFrom(src => src.is_available))
                .ForMember(dest => dest.BatteryCapacity, opt => opt.MapFrom(src => src.battery_capacity))
                .ForMember(dest => dest.Condition, opt => opt.MapFrom(src => src.condition))
                .ForMember(dest => dest.CurrentMileage, opt => opt.MapFrom(src => src.current_mileage))
                .ForMember(dest => dest.ReleaseYear, opt => opt.MapFrom(src => src.release_year))
                
                // Map các object lồng nhau (AutoMapper sẽ dùng 2 map lồng nhau ở trên)
                .ForMember(dest => dest.VehicleModel, opt => opt.MapFrom(src => src.vehicle_model)) 
                .ForMember(dest => dest.Station, opt => opt.MapFrom(src => src.station));

            // 3. Map Update DTOs (Dùng cho PUT/PATCH)
            CreateMap<VehicleStatusUpdateDto, Vehicle>()
                .ForMember(dest => dest.condition, opt => opt.MapFrom(src => src.Condition))
                .ForMember(dest => dest.is_available, opt => opt.MapFrom(src => src.IsAvailable))
                .ForMember(dest => dest.battery_capacity, opt => opt.MapFrom(src => src.BatteryCapacity))
                .ForMember(dest => dest.current_mileage, opt => opt.MapFrom(src => src.CurrentMileage));
            
            CreateMap<VehicleLocationUpdateDto, Vehicle>()
                .ForMember(dest => dest.station_id, opt => opt.MapFrom(src => src.StationId));
        
        }
    }
}