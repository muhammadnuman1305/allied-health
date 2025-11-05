namespace AlliedHealth.Service.DTOs.AHA
{
    public class GetAHAPatientDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; }
        public string Phone { get; set; }
        public int ActiveTasks { get; set; }
        public DateTime? LastActivityDate { get; set; }
        public bool Hidden { get; set; }
    }

    public class GetAHAPatientDetailsDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Mrn { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string PrimaryPhone { get; set; }
        public string Email { get; set; }
        public string EmergencyContactName { get; set; }
        public string EmergencyContactPhone { get; set; }
        public string EmergencyContactEmail { get; set; }

        // Summary cards
        public int ActiveTasks { get; set; }
        public int TotalTasks { get; set; }
        public int TotalReferrals { get; set; }
    }

    public class GetAHAPatientSummaryDTO
    { 
        public int TotalPatients { get; set; }
        public int NewPatients { get; set; }
        public int ActiveTasks { get; set; }
        public int CompletedTasks { get; set; }
    }
}
