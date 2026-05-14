namespace AlliedHealth.Service.DTOs
{
    public class GetVacationRequestDTO
    {
        public Guid Id { get; set; }
        public Guid AhaUserId { get; set; }
        public string AhaName { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public int Status { get; set; }
        public DateTime SubmittedDate { get; set; }
        public Guid? ReviewedById { get; set; }
        public string? ReviewedByName { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class CreateVacationRequestDTO
    {
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ReviewVacationRequestDTO
    {
        public Guid Id { get; set; }
        public bool Approve { get; set; }
        public string? RejectionReason { get; set; }
    }
}
