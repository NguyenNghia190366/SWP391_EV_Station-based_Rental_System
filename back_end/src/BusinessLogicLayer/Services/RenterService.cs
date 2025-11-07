using AutoMapper;
using BusinessLogicLayer.DTOs.Renter;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class RenterService : IRenterService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public RenterService(ApplicationDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // Implement các phương thức của IRenterService ở đây
        private async Task<(int renterId, CCCD? cccd, Driver_License? dl)> LoadDocumentsAsync(int userId)
        {
            var renter = await _db.Renters
                .Include(r => r.CCCD)
                .Include(r => r.Driver_License)
                .SingleOrDefaultAsync(r => r.user_id == userId);

            if (renter == null) 
            {
                throw new KeyNotFoundException($"Renter not found for User ID: {userId}");
            }

            return (renter.renter_id, renter.CCCD, renter.Driver_License); 
        }

        public async Task<RenterDocumentsViewDto> GetMyDocumentsAsync(int userId)
        {
            var (_, cccd, dl) = await LoadDocumentsAsync(userId);
            var dto = new RenterDocumentsViewDto();

            if (cccd != null) _mapper.Map(cccd, dto);
            if (dl   != null) _mapper.Map(dl, dto);

            return dto;
        }
        public async Task<RenterDocumentsViewDto> UpsertMyDocumentsAsync(int userId, RenterDocumentsUpsertDto dto)
        {
            var (renterId, cccd, dl) = await LoadDocumentsAsync(userId);

            if (cccd == null)
            {
                cccd = new CCCD { renter_id = renterId };
                _db.CCCDs.Add(cccd);
            }
            _mapper.Map(dto, cccd);

            if (dl == null)
            {
                dl = new Driver_License { renter_id = renterId };
                _db.Driver_Licenses.Add(dl);
            }
            _mapper.Map(dto, dl);

            await _db.SaveChangesAsync();
            // Trả về view sau khi lưu
            var view = new RenterDocumentsViewDto();
            _mapper.Map(cccd, view);
            _mapper.Map(dl, view);
            return view;
        }

        public async Task<bool> HasVerifiedDocumentsAsync(int userId)
        {
            // 1. Lấy Renter và các giấy tờ liên quan
            var renter = await _db.Renters
                .Include(r => r.CCCD)
                .Include(r => r.Driver_License)
                // Thay vì lọc bằng renter_id, cậu lọc bằng user_id 
                .SingleOrDefaultAsync(r => r.user_id == userId); 

            // 2. Nếu không tìm thấy renter (tức là user này không phải Renter),
            //    chắc chắn là false
            if (renter == null) 
            {
                return false;
            }

            // 3. Kiểm tra logic giấy tờ trong C# (an toàn)

            // Kiểm tra CCCD: Phải tồn tại (khác null) VÀ 2 trường con không được rỗng
            bool hasValidCccd = renter.CCCD != null 
                                && !string.IsNullOrWhiteSpace(renter.CCCD.id_card_number)
                                && !string.IsNullOrWhiteSpace(renter.CCCD.url_cccd_cmnd);

            // Kiểm tra Driver License: Tương tự
            bool hasValidDl = renter.Driver_License != null
                            && !string.IsNullOrWhiteSpace(renter.Driver_License.driver_license_number)
                            && !string.IsNullOrWhiteSpace(renter.Driver_License.url_driver_license);

            // 4. Trả về kết quả: Phải có cả 2
            return hasValidCccd && hasValidDl;
        }

    }
}