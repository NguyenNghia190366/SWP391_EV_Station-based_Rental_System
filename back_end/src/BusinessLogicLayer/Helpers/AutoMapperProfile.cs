using AutoMapper;
using DataAccessLayer.Models;
using BusinessLogicLayer.DTOs.VehicleModels; // Import DTOs của cậu

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
        }
    }
}