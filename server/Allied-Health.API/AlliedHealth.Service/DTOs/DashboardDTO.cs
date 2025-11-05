namespace AlliedHealth.Service.DTOs
{
    public class GetDashboardDetailsDTO
    {
        public int TotalPatients { get; set; }
        public int TotalDepartments { get; set; }
        public int TotalSpecialties { get; set; }
        public int TotalUsers { get; set; }

        // Task summary
        public int AssignedTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int HighPriorityTasks { get; set; }
        public int MediumPriorityTasks { get; set; }
        public int LowPriorityTasks { get; set; }

        // Referral summary
        public int PendingReferrals { get; set; }
        public int AcceptedReferrals { get; set; }
        public int RejectedReferrals { get; set; }
        public int TotalReferrals { get; set; }
        public int IncomingReferrals { get; set; }
        public int OutgoingReferrals { get; set; }

        // Intervention outcome summary
        public int SeenOutcomes { get; set; }
        public int AttemptedOutcomes { get; set; }
        public int DeclinedOutcomes { get; set; }
        public int UnseenOutcomes { get; set; }
        public int HandoverOutcomes { get; set; }
    }
}
