using AlliedHealth.Common.Enums;
using AlliedHealth.Domain;
using AlliedHealth.Domain.Entities;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AlliedHealth.Service.Implementation
{
    public class VacationService : IVacationService
    {
        private readonly AlliedHealthDbContext _dbContext;

        public VacationService(AlliedHealthDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public IQueryable<GetVacationRequestDTO> GetMyRequests(Guid ahaUserId)
        {
            return from v in _dbContext.VacationRequests
                   join reviewer in _dbContext.Users on v.ReviewedById equals (Guid?)reviewer.Id into reviewerGroup
                   from reviewer in reviewerGroup.DefaultIfEmpty()
                   where v.AhaUserId == ahaUserId
                   orderby v.SubmittedDate descending
                   select new GetVacationRequestDTO
                   {
                       Id = v.Id,
                       AhaUserId = v.AhaUserId,
                       AhaName = v.AhaUser.FirstName + " " + v.AhaUser.LastName,
                       StartDate = v.StartDate,
                       EndDate = v.EndDate,
                       Reason = v.Reason,
                       Status = v.Status,
                       SubmittedDate = v.SubmittedDate,
                       ReviewedById = v.ReviewedById,
                       ReviewedByName = reviewer != null ? reviewer.FirstName + " " + reviewer.LastName : null,
                       ReviewedDate = v.ReviewedDate,
                       RejectionReason = v.RejectionReason
                   };
        }

        public async Task<string?> CreateRequest(Guid ahaUserId, CreateVacationRequestDTO request)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var maxDate = today.AddMonths(1);

            if (request.StartDate < today || request.EndDate > maxDate || request.StartDate > request.EndDate)
                return EMessages.VacationDateInvalid;

            // Check no overlapping non-rejected request already exists
            var overlap = await _dbContext.VacationRequests.AnyAsync(v =>
                v.AhaUserId == ahaUserId &&
                v.Status != (int)EVacationStatus.Rejected &&
                v.StartDate <= request.EndDate &&
                v.EndDate >= request.StartDate);

            if (overlap)
                return EMessages.VacationOverlap;

            await _dbContext.VacationRequests.AddAsync(new VacationRequest
            {
                Id = Guid.NewGuid(),
                AhaUserId = ahaUserId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Reason = request.Reason,
                Status = (int)EVacationStatus.Pending,
                SubmittedDate = DateTime.UtcNow
            });

            await _dbContext.SaveChangesAsync();
            return null;
        }

        public IQueryable<GetVacationRequestDTO> GetAllRequests()
        {
            return from v in _dbContext.VacationRequests
                   join reviewer in _dbContext.Users on v.ReviewedById equals (Guid?)reviewer.Id into reviewerGroup
                   from reviewer in reviewerGroup.DefaultIfEmpty()
                   orderby v.SubmittedDate descending
                   select new GetVacationRequestDTO
                   {
                       Id = v.Id,
                       AhaUserId = v.AhaUserId,
                       AhaName = v.AhaUser.FirstName + " " + v.AhaUser.LastName,
                       StartDate = v.StartDate,
                       EndDate = v.EndDate,
                       Reason = v.Reason,
                       Status = v.Status,
                       SubmittedDate = v.SubmittedDate,
                       ReviewedById = v.ReviewedById,
                       ReviewedByName = reviewer != null ? reviewer.FirstName + " " + reviewer.LastName : null,
                       ReviewedDate = v.ReviewedDate,
                       RejectionReason = v.RejectionReason
                   };
        }

        public async Task<string?> ReviewRequest(Guid reviewerId, ReviewVacationRequestDTO request)
        {
            var vacation = await _dbContext.VacationRequests.FindAsync(request.Id);

            if (vacation == null)
                return EMessages.VacationNotExists;

            if (vacation.Status != (int)EVacationStatus.Pending)
                return EMessages.VacationAlreadyReviewed;

            vacation.Status = request.Approve
                ? (int)EVacationStatus.Approved
                : (int)EVacationStatus.Rejected;
            vacation.ReviewedById = reviewerId;
            vacation.ReviewedDate = DateTime.UtcNow;
            vacation.RejectionReason = request.Approve ? null : request.RejectionReason;

            await _dbContext.SaveChangesAsync();
            return null;
        }
    }
}
