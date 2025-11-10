using AutoMapper;
using DataAccessLayer.Models;
using BusinessLogicLayer.DTOs.VehicleModels;
using BusinessLogicLayer.DTOs.Vehicles;
using BusinessLogicLayer.DTOs.RentalOrder;
using BusinessLogicLayer.DTOs.Contract;
using BusinessLogicLayer.DTOs.Staff;
using BusinessLogicLayer.DTOs.Renter;
using BusinessLogicLayer.DTOs.Vehicle;
using BusinessLogicLayer.DTOs.FeeType;
using BusinessLogicLayer.DTOs.ExtraFee;
using BusinessLogicLayer.DTOs.Payment;
// using BusinessLogicLayer.DTOs.Contract;

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
                
                .ForMember(dest => dest.current_mileage, opt => opt.MapFrom(src => src.CurrentMileage))
                .ForMember(dest => dest.img_car_url, opt => opt.MapFrom(src => src.ImgCarUrl))
                .ForMember(dest => dest.condition, opt => opt.MapFrom(src => src.Condition));

            // 2. Map Entity Vehicle -> View DTO
            CreateMap<Vehicle, VehicleViewDto>()
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src => src.vehicle_id))
                .ForMember(dest => dest.LicensePlate, opt => opt.MapFrom(src => src.license_plate))
                .ForMember(dest => dest.ImgCarUrl, opt => opt.MapFrom(src => src.img_car_url))
                .ForMember(dest => dest.IsAvailable, opt => opt.MapFrom(src => src.is_available))
                .ForMember(dest => dest.BatteryCapacity, opt => opt.MapFrom(src => src.vehicle_model.battery_capacity))
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
                
                .ForMember(dest => dest.current_mileage, opt => opt.MapFrom(src => src.CurrentMileage));

            CreateMap<VehicleLocationUpdateDto, Vehicle>()
                .ForMember(dest => dest.station_id, opt => opt.MapFrom(src => src.StationId));


            // ========== RentalOrder ==========

            // Map DTO lồng nhau (Lấy thông tin User gán vào RenterNestedDto)
            CreateMap<Renter, RenterNestedDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user.full_name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.user.email));

            // Map DTO lồng nhau cho Payment
            CreateMap<Payment, PaymentNestedDto>();

            // 1. Map Create DTO -> Entity RentalOrder
            CreateMap<RentalOrderCreateDto, RentalOrder>()
                .ForMember(dest => dest.vehicle_id, opt => opt.MapFrom(src => src.VehicleId))
                .ForMember(dest => dest.pickup_station_id, opt => opt.MapFrom(src => src.PickupStationId))
                .ForMember(dest => dest.return_station_id, opt => opt.MapFrom(src => src.ReturnStationId))
                .ForMember(dest => dest.start_time, opt => opt.MapFrom(src => src.StartTime))
                .ForMember(dest => dest.end_time, opt => opt.MapFrom(src => src.EndTime))
                .ForMember(dest => dest.deposit_amount, opt => opt.MapFrom(src => src.DepositAmount));

            // 2. Map Entity RentalOrder -> View DTO
            CreateMap<RentalOrder, RentalOrderViewDto>()
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.order_id))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
                .ForMember(dest => dest.PickupStation, opt => opt.MapFrom(src => src.pickup_station))
                .ForMember(dest => dest.ReturnStation, opt => opt.MapFrom(src => src.return_station))
                .ForMember(dest => dest.Payments, opt => opt.MapFrom(src => src.Payments));

            // ==========  CONTRACT ==========
            // --- Mapping cho Contract ---
            CreateMap<Contract, ContractViewDto>()
                // Map các DTO lồng nhau
                .ForMember(dest => dest.StaffInfo, opt => opt.MapFrom(src => src.staff))
                .ForMember(dest => dest.RenterInfo, opt => opt.MapFrom(src => src.order.renter))
                .ForMember(dest => dest.VehicleInfo, opt => opt.MapFrom(src => src.order.vehicle))
                .ForMember(dest => dest.OrderInfo, opt => opt.MapFrom(src => src.order));

            // --- Mapping cho các DTO tóm tắt (Brief) ---

            // Staff -> StaffBriefDto
            CreateMap<Staff, StaffBriefDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user.full_name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.user.email));

            // Renter -> RenterBriefDto
            CreateMap<Renter, RenterBriefDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user.full_name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.user.email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.user.phone_number));

            // Vehicle -> VehicleBriefDto
            CreateMap<Vehicle, VehicleBriefDto>()
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.vehicle_model.brand_name))
                .ForMember(dest => dest.ModelName, opt => opt.MapFrom(src => src.vehicle_model.model_name));

            // RentalOrder -> RentalOrderBriefDto
            // Các trường tên giống nhau, AutoMapper tự xử lý
            CreateMap<RentalOrder, RentalOrderBriefDto>();


            // ========== FeeType (Admin) ==========
            
            // Map Create DTO -> Entity
            CreateMap<FeeTypeCreateDto, FeeType>()
                .ForMember(dest => dest.FeeType1, opt => opt.MapFrom(src => src.FeeType))
                .ForMember(dest => dest.amount, opt => opt.MapFrom(src => src.Amount));
            
            // Map Update DTO -> Entity
            CreateMap<FeeTypeUpdateDto, FeeType>()
                .ForMember(dest => dest.FeeType1, opt => opt.MapFrom(src => src.FeeType))
                .ForMember(dest => dest.amount, opt => opt.MapFrom(src => src.Amount));

            // Map Entity -> View DTO
            CreateMap<FeeType, FeeTypeViewDto>()
                .ForMember(dest => dest.FeeTypeId, opt => opt.MapFrom(src => src.FeeType_id))
                .ForMember(dest => dest.FeeType, opt => opt.MapFrom(src => src.FeeType1))
                .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.amount));

            // ========== ExtraFee (Staff) ==========

            // Map Create DTO -> Entity
            CreateMap<ExtraFeeCreateDto, ExtraFee>()
                .ForMember(dest => dest.order_id, opt => opt.MapFrom(src => src.OrderId))
                .ForMember(dest => dest.FeeType_id, opt => opt.MapFrom(src => src.FeeTypeId))
                .ForMember(dest => dest.description, opt => opt.MapFrom(src => src.Description));

            // Map Entity -> View DTO (Mapping này phức tạp hơn, 
            // vì cần join, tớ sẽ dùng 'Select' trong Service để rõ ràng)


            // ========== PAYMENT ==========
            CreateMap<Payment, PaymentViewDto>()
                .ForMember(dest => dest.PaymentId, opt => opt.MapFrom(src => src.payment_id))
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.order_id))
                .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.amount))
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.payment_method))
                .ForMember(dest => dest.PaymentDate, opt => opt.MapFrom(src => src.payment_date))
                .ForMember(dest => dest.ExternalRef, opt => opt.MapFrom(src => src.external_ref));

            // ========== CCCD & Driver License ==========
            // CCCD -> view
            CreateMap<CCCD, RenterDocumentsViewDto>()
                .ForMember(d => d.IdCardNumber,      m => m.MapFrom(s => s.id_card_number))
                .ForMember(d => d.IdCardImageUrl,    m => m.MapFrom(s => s.url_cccd_cmnd));

            // Driver_License -> view (merge ở service)
            CreateMap<Driver_License, RenterDocumentsViewDto>()
                .ForMember(d => d.DriverLicenseNumber, m => m.MapFrom(s => s.driver_license_number))
                .ForMember(d => d.DriverLicenseImageUrl, m => m.MapFrom(s => s.url_driver_license));
            
            // 1. Map Upsert DTO -> CCCD (Dùng cho hàm PUT)
            CreateMap<RenterDocumentsUpsertDto, CCCD>()
                .ForMember(dest => dest.id_card_number, 
                           opt => opt.MapFrom(src => src.IdCardNumber))
                .ForMember(dest => dest.url_cccd_cmnd, 
                           opt => opt.MapFrom(src => src.IdCardImageUrl));

            // 2. Map Upsert DTO -> Driver_License (Dùng cho hàm PUT)
            CreateMap<RenterDocumentsUpsertDto, Driver_License>()
                .ForMember(dest => dest.driver_license_number, 
                           opt => opt.MapFrom(src => src.DriverLicenseNumber))
                .ForMember(dest => dest.url_driver_license, 
                           opt => opt.MapFrom(src => src.DriverLicenseImageUrl));
        }
    }
}