using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskSeverityRepetitionsReviewDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Task: Severity (1=Low default), RequiredRepetitions, CompletedRepetitions, LastReviewDate, TaskType
            migrationBuilder.AddColumn<int>(
                name: "Severity",
                table: "Task",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "RequiredRepetitions",
                table: "Task",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CompletedRepetitions",
                table: "Task",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateOnly>(
                name: "LastReviewDate",
                table: "Task",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaskType",
                table: "Task",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Referral: LastReviewDate
            migrationBuilder.AddColumn<DateOnly>(
                name: "LastReviewDate",
                table: "Referral",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Severity", table: "Task");
            migrationBuilder.DropColumn(name: "RequiredRepetitions", table: "Task");
            migrationBuilder.DropColumn(name: "CompletedRepetitions", table: "Task");
            migrationBuilder.DropColumn(name: "LastReviewDate", table: "Task");
            migrationBuilder.DropColumn(name: "TaskType", table: "Task");
            migrationBuilder.DropColumn(name: "LastReviewDate", table: "Referral");
        }
    }
}
