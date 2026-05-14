namespace AlliedHealth.Domain.Entities
{
    public class VacationRequest
    {
        public Guid Id { get; set; }
        public Guid AhaUserId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public int Status { get; set; } // EVacationStatus: 1=Pending, 2=Approved, 3=Rejected
        public DateTime SubmittedDate { get; set; }
        public Guid? ReviewedById { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public string? RejectionReason { get; set; }

        // Navigation
        public User AhaUser { get; set; } = null!;
        public User? ReviewedBy { get; set; }
    }
}
