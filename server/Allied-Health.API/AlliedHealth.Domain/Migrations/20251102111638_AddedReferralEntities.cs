using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddedReferralEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Task_DepartmentId",
                table: "Task");

            migrationBuilder.DropIndex(
                name: "IX_Task_PatientId",
                table: "Task");

            migrationBuilder.DropColumn(
                name: "DueTime",
                table: "Task");

            migrationBuilder.AlterColumn<string>(
                name: "Goals",
                table: "Task",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Diagnosis",
                table: "Task",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "ReferralId",
                table: "Task",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Referral",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<int>(type: "integer", nullable: false),
                    ReferringTherapist = table.Column<Guid>(type: "uuid", nullable: false),
                    OriginDepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    DestinationDepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Diagnosis = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    Goals = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "timezone('utc', now())"),
                    ModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    Hidden = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Referral", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Referral_Department_DestinationDepartmentId",
                        column: x => x.DestinationDepartmentId,
                        principalTable: "Department",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Referral_Department_OriginDepartmentId",
                        column: x => x.OriginDepartmentId,
                        principalTable: "Department",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Referral_Patient_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patient",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Referral_User_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Referral_User_ModifiedBy",
                        column: x => x.ModifiedBy,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Referral_User_ReferringTherapist",
                        column: x => x.ReferringTherapist,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReferralIntervention",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferralId = table.Column<Guid>(type: "uuid", nullable: false),
                    InterventionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReferralIntervention", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReferralIntervention_Intervention_InterventionId",
                        column: x => x.InterventionId,
                        principalTable: "Intervention",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReferralIntervention_Referral_ReferralId",
                        column: x => x.ReferralId,
                        principalTable: "Referral",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Task_DepartmentId_Status_Priority",
                table: "Task",
                columns: new[] { "DepartmentId", "Status", "Priority" });

            migrationBuilder.CreateIndex(
                name: "IX_Task_Hidden",
                table: "Task",
                column: "Hidden");

            migrationBuilder.CreateIndex(
                name: "IX_Task_PatientId_StartDate_EndDate",
                table: "Task",
                columns: new[] { "PatientId", "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Task_ReferralId",
                table: "Task",
                column: "ReferralId");

            migrationBuilder.CreateIndex(
                name: "IX_Referral_CreatedBy",
                table: "Referral",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Referral_DestinationDepartmentId",
                table: "Referral",
                column: "DestinationDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Referral_Hidden",
                table: "Referral",
                column: "Hidden");

            migrationBuilder.CreateIndex(
                name: "IX_Referral_ModifiedBy",
                table: "Referral",
                column: "ModifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Referral_OriginDepartmentId_DestinationDepartmentId",
                table: "Referral",
                columns: new[] { "OriginDepartmentId", "DestinationDepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_Referral_PatientId_Status",
                table: "Referral",
                columns: new[] { "PatientId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Referral_ReferringTherapist",
                table: "Referral",
                column: "ReferringTherapist");

            migrationBuilder.CreateIndex(
                name: "IX_ReferralIntervention_InterventionId",
                table: "ReferralIntervention",
                column: "InterventionId");

            migrationBuilder.CreateIndex(
                name: "IX_ReferralIntervention_ReferralId_InterventionId",
                table: "ReferralIntervention",
                columns: new[] { "ReferralId", "InterventionId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Task_Referral_ReferralId",
                table: "Task",
                column: "ReferralId",
                principalTable: "Referral",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Task_Referral_ReferralId",
                table: "Task");

            migrationBuilder.DropTable(
                name: "ReferralIntervention");

            migrationBuilder.DropTable(
                name: "Referral");

            migrationBuilder.DropIndex(
                name: "IX_Task_DepartmentId_Status_Priority",
                table: "Task");

            migrationBuilder.DropIndex(
                name: "IX_Task_Hidden",
                table: "Task");

            migrationBuilder.DropIndex(
                name: "IX_Task_PatientId_StartDate_EndDate",
                table: "Task");

            migrationBuilder.DropIndex(
                name: "IX_Task_ReferralId",
                table: "Task");

            migrationBuilder.DropColumn(
                name: "ReferralId",
                table: "Task");

            migrationBuilder.AlterColumn<string>(
                name: "Goals",
                table: "Task",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Diagnosis",
                table: "Task",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "DueTime",
                table: "Task",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));

            migrationBuilder.CreateIndex(
                name: "IX_Task_DepartmentId",
                table: "Task",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Task_PatientId",
                table: "Task",
                column: "PatientId");
        }
    }
}
