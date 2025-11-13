using AutoMapper;
using DataAccessLayer.Models;
using BusinessLogicLayer.DTOs.VehicleModels;
using BusinessLogicLayer.DTOs.Vehicles;
using BusinessLogicLayer.DTOs.RentalOrder;
using BusinessLogicLayer.DTOs.Contract;
using BusinessLogicLayer.DTOs.Staff;
using BusinessLogicLayer.DTOs.Renter;
using BusinessLogicLayer.DTOs.Vehicle;
using BusinessLogicLayer.DTOs.Payment;
using BusinessLogicLayer.DTOs.Report;
using BusinessLogicLayer.DTOs.ExtraFeeType;
using BusinessLogicLayer.DTOs.Complaint;

namespace BusinessLogicLayer.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // ========== VehicleModel ==========
            #region 
            // Map Create DTO -> Entity
            CreateMap<VehicleModelCreateDto, Vehicle_Model>()
                .ForMember(dest => dest.brand_name, opt => opt.MapFrom(src => src.BrandName))
                .ForMember(dest => dest.model_name, opt => opt.MapFrom(src => src.ModelName))
                .ForMember(dest => dest.vehicle_color, opt => opt.MapFrom(src => src.VehicleColor))
                .ForMember(dest => dest.number_of_seats, opt => opt.MapFrom(src => src.NumberOfSeats))
                .ForMember(dest => dest.mileage, opt => opt.MapFrom(src => src.Mileage))
                // --- THÊM 4 TRƯỜNG MỚI ---
                .ForMember(dest => dest.type_of_battery, opt => opt.MapFrom(src => src.TypeOfBattery))
                .ForMember(dest => dest.battery_capacity, opt => opt.MapFrom(src => src.BatteryCapacity))
                .ForMember(dest => dest.price_per_hour, opt => opt.MapFrom(src => src.PricePerHour))
                .ForMember(dest => dest.deposit, opt => opt.MapFrom(src => src.Deposit));

            // Map Update DTO -> Entity
            CreateMap<VehicleModelUpdateDto, Vehicle_Model>()
                .ForMember(dest => dest.brand_name, opt => opt.MapFrom(src => src.BrandName))
                .ForMember(dest => dest.model_name, opt => opt.MapFrom(src => src.ModelName))
                .ForMember(dest => dest.vehicle_color, opt => opt.MapFrom(src => src.VehicleColor))
                .ForMember(dest => dest.number_of_seats, opt => opt.MapFrom(src => src.NumberOfSeats))
                .ForMember(dest => dest.mileage, opt => opt.MapFrom(src => src.Mileage))
                // --- THÊM 4 TRƯỜNG MỚI ---
                .ForMember(dest => dest.type_of_battery, opt => opt.MapFrom(src => src.TypeOfBattery))
                .ForMember(dest => dest.battery_capacity, opt => opt.MapFrom(src => src.BatteryCapacity))
                .ForMember(dest => dest.price_per_hour, opt => opt.MapFrom(src => src.PricePerHour))
                .ForMember(dest => dest.deposit, opt => opt.MapFrom(src => src.Deposit));

            // Map Entity -> View DTO
            CreateMap<Vehicle_Model, VehicleModelViewDto>()
                .ForMember(dest => dest.VehicleModelId, opt => opt.MapFrom(src => src.vehicle_model_id))
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.brand_name))
                .ForMember(dest => dest.ModelName, opt => opt.MapFrom(src => src.model_name))
                .ForMember(dest => dest.VehicleColor, opt => opt.MapFrom(src => src.vehicle_color))
                .ForMember(dest => dest.NumberOfSeats, opt => opt.MapFrom(src => src.number_of_seats))
                .ForMember(dest => dest.Mileage, opt => opt.MapFrom(src => src.mileage))
                // --- THÊM 4 TRƯỜNG MỚI ---
                .ForMember(dest => dest.TypeOfBattery, opt => opt.MapFrom(src => src.type_of_battery))
                .ForMember(dest => dest.BatteryCapacity, opt => opt.MapFrom(src => src.battery_capacity))
                .ForMember(dest => dest.PricePerHour, opt => opt.MapFrom(src => src.price_per_hour))
                .ForMember(dest => dest.Deposit, opt => opt.MapFrom(src => src.deposit))
                // --- (VehiclesCount vẫn giữ nguyên) ---
                .ForMember(dest => dest.VehiclesCount, opt => opt.MapFrom(src => src.Vehicles.Count));
            #endregion

            // ==========  VEHICLE ==========
            #region 
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
            #endregion

            // ========== RentalOrder ==========
            #region 
            // (Sửa DTO lồng nhau)
            CreateMap<Renter, RenterNestedDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user.full_name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.user.email));

            // === SỬA DTO LỒNG NHAU PAYMENT ===
            CreateMap<Payment, PaymentNestedDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.created_at))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.descrition));

            // === TẠO DTO LỒNG NHAU STAFF ===
            CreateMap<Staff, StaffNestedDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user.full_name));

            // === SỬA MAP CREATE DTO (Xóa DepositAmount) ===
            CreateMap<RentalOrderCreateDto, RentalOrder>()
                .ForMember(dest => dest.vehicle_id, opt => opt.MapFrom(src => src.VehicleId))
                .ForMember(dest => dest.pickup_station_id, opt => opt.MapFrom(src => src.PickupStationId))
                .ForMember(dest => dest.return_station_id, opt => opt.MapFrom(src => src.ReturnStationId))
                .ForMember(dest => dest.start_time, opt => opt.MapFrom(src => src.StartTime))
                .ForMember(dest => dest.end_time, opt => opt.MapFrom(src => src.EndTime));
            // (Đã xóa deposit_amount)

            // === SỬA MAP VIEW DTO (Thêm ảnh, staff; xóa trường cũ) ===
            CreateMap<RentalOrder, RentalOrderViewDto>()
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.order_id))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
                .ForMember(dest => dest.PickupStation, opt => opt.MapFrom(src => src.pickup_station))
                .ForMember(dest => dest.ReturnStation, opt => opt.MapFrom(src => src.return_station))
                .ForMember(dest => dest.Payments, opt => opt.MapFrom(src => src.Payments))
                // Map Staff (CSDL Mới)
                .ForMember(dest => dest.PickupStaff, opt => opt.MapFrom(src => src.pickup_staff))
                .ForMember(dest => dest.ReturnStaff, opt => opt.MapFrom(src => src.return_staff))
                // Map Ảnh (CSDL Mới) - Chuyển ICollection<Model> -> List<string>
                .ForMember(dest => dest.ImgVehicleBefores, opt => opt.MapFrom(src => src.Img_Vehicle_Befores.Select(img => img.img_vehicle_before_URL)))
                .ForMember(dest => dest.ImgVehicleAfters, opt => opt.MapFrom(src => src.Img_Vehicle_Afters.Select(img => img.img_vehicle_after_URL)));
            #endregion


            // ==========  CONTRACT ==========
            #region
            // (Giữ nguyên map Contract, StaffBrief, RenterBrief, VehicleBrief, RentalOrderBrief)
            CreateMap<Contract, ContractViewDto>()
            // === THÊM MAP CHO CSDL MỚI ===
                .ForMember(dest => dest.ContractId, opt => opt.MapFrom(src => src.contract_id))
                .ForMember(dest => dest.SignedDate, opt => opt.MapFrom(src => src.signed_date))

                .ForMember(dest => dest.ContractRenterSigningimgUrl, opt => opt.MapFrom(src => src.contract_renter_signingimg_url))
                .ForMember(dest => dest.ContractOwnerSigningimgUrl, opt => opt.MapFrom(src => src.contract_owner_signingimg_url))
            // (Các map lồng nhau)
                .ForMember(dest => dest.StaffInfo, opt => opt.MapFrom(src => src.staff))
                .ForMember(dest => dest.RenterInfo, opt => opt.MapFrom(src => src.order.renter))
                .ForMember(dest => dest.VehicleInfo, opt => opt.MapFrom(src => src.order.vehicle))
                .ForMember(dest => dest.OrderInfo, opt => opt.MapFrom(src => src.order));

            CreateMap<Staff, StaffBriefDto>()
            // --- BỔ SUNG DÒNG NÀY ---
                .ForMember(dest => dest.StaffId, opt => opt.MapFrom(src => src.staff_id))

                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user.full_name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.user.email));
            CreateMap<Renter, RenterBriefDto>()
            // --- BỔ SUNG DÒNG NÀY ---
                .ForMember(dest => dest.RenterId, opt => opt.MapFrom(src => src.renter_id))

                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user.full_name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.user.email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.user.phone_number));
            CreateMap<Vehicle, VehicleBriefDto>()
            // --- BỔ SUNG 2 DÒNG NÀY ---
                .ForMember(dest => dest.VehicleId, opt => opt.MapFrom(src => src.vehicle_id))
                .ForMember(dest => dest.LicensePlate, opt => opt.MapFrom(src => src.license_plate))
                // -------------------------
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.vehicle_model.brand_name))
                .ForMember(dest => dest.ModelName, opt => opt.MapFrom(src => src.vehicle_model.model_name));
            // (Thêm map mới chi tiết hơn)
            CreateMap<RentalOrder, RentalOrderBriefDto>()
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.order_id))
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.start_time))
                .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.end_time))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.total_amount))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status));
            #endregion


            // ========== PAYMENT ==========
            #region 
            CreateMap<Payment, PaymentViewDto>()
                .ForMember(dest => dest.PaymentId, opt => opt.MapFrom(src => src.payment_id))
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.order_id))
                .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.amount))
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.payment_method))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.created_at)) // Sửa tên
                .ForMember(dest => dest.FeeType, opt => opt.MapFrom(src => src.fee_type))     // Thêm
                .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => src.payment_status)) // Thêm
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.descrition)); // Thêm
            #endregion
            // ========== CCCD & Driver License ==========
            #region
            // CCCD -> view
            CreateMap<CCCD, RenterDocumentsViewDto>()
                .ForMember(d => d.IdCardNumber, m => m.MapFrom(s => s.id_card_number))
                .ForMember(d => d.UrlCccdCmndFront, m => m.MapFrom(s => s.url_cccd_cmnd_front)) // Sửa
                .ForMember(d => d.UrlCccdCmndBack, m => m.MapFrom(s => s.url_cccd_cmnd_back));  // Thêm

            // Driver_License -> view
            CreateMap<Driver_License, RenterDocumentsViewDto>()
                .ForMember(d => d.DriverLicenseNumber, m => m.MapFrom(s => s.driver_license_number))
                .ForMember(d => d.UrlDriverLicenseFront, m => m.MapFrom(s => s.url_driver_license_front)) // Sửa
                .ForMember(d => d.UrlDriverLicenseBack, m => m.MapFrom(s => s.url_driver_license_back));  // Thêm

            // 1. Map Upsert DTO -> CCCD
            CreateMap<CccdUpsertDto, CCCD>()
                .ForMember(dest => dest.id_card_number, opt => opt.MapFrom(src => src.IdCardNumber))
                .ForMember(dest => dest.url_cccd_cmnd_front, opt => opt.MapFrom(src => src.UrlCccdCmndFront)) // Sửa
                .ForMember(dest => dest.url_cccd_cmnd_back, opt => opt.MapFrom(src => src.UrlCccdCmndBack));  // Thêm

            // 2. Map Upsert DTO -> Driver_License
            CreateMap<DriverLicenseUpsertDto, Driver_License>()
                .ForMember(dest => dest.driver_license_number, opt => opt.MapFrom(src => src.DriverLicenseNumber))
                .ForMember(dest => dest.url_driver_license_front, opt => opt.MapFrom(src => src.UrlDriverLicenseFront)) // Sửa
                .ForMember(dest => dest.url_driver_license_back, opt => opt.MapFrom(src => src.UrlDriverLicenseBack));  // Thêm
            #endregion

            // ========== REPORT (CSDL MỚI) ==========
            #region             
            CreateMap<Report, ReportViewDto>()
                .ForMember(dest => dest.ReportId, opt => opt.MapFrom(src => src.report_id))
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.order_id))
                .ForMember(dest => dest.StaffId, opt => opt.MapFrom(src => src.staff_id))
                .ForMember(dest => dest.Detail, opt => opt.MapFrom(src => src.detail))

                // Map lồng nhau: Lấy tên Staff từ User
                .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.staff.user.full_name))

                // Map lồng nhau: Lấy danh sách URL ảnh (1-N)
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => src.Report_EV_Imgs.Select(img => img.img_url)));
            #endregion

            // ========== EXTRAFEETYPE (CSDL MỚI) ==========
            #region
            // Map Create DTO -> Entity
            CreateMap<ExtraFeeTypeCreateDto, ExtraFeeType>()
                .ForMember(dest => dest.extra_fee_type_name, opt => opt.MapFrom(src => src.ExtraFeeTypeName))
                .ForMember(dest => dest.amount, opt => opt.MapFrom(src => src.Amount));

            // Map Update DTO -> Entity
            CreateMap<ExtraFeeTypeUpdateDto, ExtraFeeType>()
                .ForMember(dest => dest.extra_fee_type_name, opt => opt.MapFrom(src => src.ExtraFeeTypeName))
                .ForMember(dest => dest.amount, opt => opt.MapFrom(src => src.Amount));

            // Map Entity -> View DTO
            CreateMap<ExtraFeeType, ExtraFeeTypeViewDto>()
                .ForMember(dest => dest.ExtraFeeTypeId, opt => opt.MapFrom(src => src.extra_fee_type_id))
                .ForMember(dest => dest.ExtraFeeTypeName, opt => opt.MapFrom(src => src.extra_fee_type_name))
                .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.amount));
            #endregion


            // ========== RENTER  ==========
            #region 
            // MAP DTO VIEW XÁC THỰC RENTER
            CreateMap<Renter, RenterVerificationViewDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.user.user_id))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user.full_name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.user.email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.user.phone_number))
                
                .ForMember(dest => dest.RenterId, opt => opt.MapFrom(src => src.renter_id))
                .ForMember(dest => dest.IsVerified, opt => opt.MapFrom(src => src.is_verified))
                .ForMember(dest => dest.RegistrationDate, opt => opt.MapFrom(src => src.registration_date))

                // Map từ CCCD (nếu có)
                .ForMember(dest => dest.IdCardNumber, opt => opt.MapFrom(src => src.CCCD!.id_card_number)) 
                .ForMember(dest => dest.UrlCccdCmndFront, opt => opt.MapFrom(src => src.CCCD!.url_cccd_cmnd_front))
                .ForMember(dest => dest.UrlCccdCmndBack, opt => opt.MapFrom(src => src.CCCD!.url_cccd_cmnd_back))

                // Map từ Driver_License (nếu có)
                .ForMember(dest => dest.DriverLicenseNumber, opt => opt.MapFrom(src => src.Driver_License!.driver_license_number))
                .ForMember(dest => dest.UrlDriverLicenseFront, opt => opt.MapFrom(src => src.Driver_License!.url_driver_license_front))
                .ForMember(dest => dest.UrlDriverLicenseBack, opt => opt.MapFrom(src => src.Driver_License!.url_driver_license_back));
            #endregion

            // ========== COMPLAINT  ==========
            #region
            // 1. Map Create DTO -> Entity
            CreateMap<ComplaintCreateDto, Complaint>()
                .ForMember(dest => dest.order_id, opt => opt.MapFrom(src => src.OrderId))
                .ForMember(dest => dest.description, opt => opt.MapFrom(src => src.Description))
                // Các trường (renter_id, status, created_date) sẽ được Service xử lý thủ công
                .ForMember(dest => dest.renter_id, opt => opt.Ignore())
                .ForMember(dest => dest.status, opt => opt.Ignore())
                .ForMember(dest => dest.created_date, opt => opt.Ignore());

            // 2. Map Entity -> View DTO
            CreateMap<Complaint, ComplaintViewDto>()
                .ForMember(dest => dest.ComplaintId, opt => opt.MapFrom(src => src.complaint_id))
                .ForMember(dest => dest.RenterId, opt => opt.MapFrom(src => src.renter_id))
                // Lấy tên Renter từ quan hệ lồng nhau (Cần Include khi truy vấn)
                .ForMember(dest => dest.RenterName, opt => opt.MapFrom(src => src.renter.user.full_name))
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.order_id))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.description))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.created_date))
                .ForMember(dest => dest.ResolveDate, opt => opt.MapFrom(src => src.resolve_date));
            #endregion




        }
    }
}