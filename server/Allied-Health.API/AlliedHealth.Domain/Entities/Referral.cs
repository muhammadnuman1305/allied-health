namespace AlliedHealth.Domain.Entities
{
    public class Referral
    {
        public Guid Id { get; set; }

        // Patient and Department details
        public int PatientId { get; set; }
        public int OriginDepartment { get; set; }
        public int DestDepartment { get; set; }
        

        // Referral details
        public Guid ReferringTherapist { get; set; }
        public DateTime ReferralDate { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }
        public int Notes { get; set; }

        // Assignment fields

    }
}
