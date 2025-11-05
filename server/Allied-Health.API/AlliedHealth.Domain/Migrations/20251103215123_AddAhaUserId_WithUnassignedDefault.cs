using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddAhaUserId_WithUnassignedDefault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientOutcome");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "TaskIntervention",
                newName: "OutcomeStatus");

            migrationBuilder.AddColumn<Guid>(
                name: "AhaUserId",
                table: "TaskIntervention",
                type: "uuid",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "Outcome",
                table: "TaskIntervention",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateOnly>(
                name: "OutcomeDate",
                table: "TaskIntervention",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.CreateIndex(
                name: "IX_TaskIntervention_AhaUserId",
                table: "TaskIntervention",
                column: "AhaUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskIntervention_WardId",
                table: "TaskIntervention",
                column: "WardId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskIntervention_User_AhaUserId",
                table: "TaskIntervention",
                column: "AhaUserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskIntervention_Ward_WardId",
                table: "TaskIntervention",
                column: "WardId",
                principalTable: "Ward",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskIntervention_User_AhaUserId",
                table: "TaskIntervention");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskIntervention_Ward_WardId",
                table: "TaskIntervention");

            migrationBuilder.DropIndex(
                name: "IX_TaskIntervention_AhaUserId",
                table: "TaskIntervention");

            migrationBuilder.DropIndex(
                name: "IX_TaskIntervention_WardId",
                table: "TaskIntervention");

            migrationBuilder.DropColumn(
                name: "AhaUserId",
                table: "TaskIntervention");

            migrationBuilder.DropColumn(
                name: "Outcome",
                table: "TaskIntervention");

            migrationBuilder.DropColumn(
                name: "OutcomeDate",
                table: "TaskIntervention");

            migrationBuilder.RenameColumn(
                name: "OutcomeStatus",
                table: "TaskIntervention",
                newName: "Status");

            migrationBuilder.CreateTable(
                name: "PatientOutcome",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<int>(type: "integer", nullable: false),
                    AdditionalNote = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    AttemptMade = table.Column<bool>(type: "boolean", nullable: false),
                    Declined = table.Column<bool>(type: "boolean", nullable: false),
                    Refer = table.Column<bool>(type: "boolean", nullable: false),
                    Seen = table.Column<bool>(type: "boolean", nullable: false),
                    Unseen = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientOutcome", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientOutcome_Patient_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patient",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PatientOutcome_PatientId",
                table: "PatientOutcome",
                column: "PatientId");
        }
    }
}
