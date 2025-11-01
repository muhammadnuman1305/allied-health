using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTaskInterventionTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Task",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "Task",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "timezone('utc', now())");

            migrationBuilder.AddColumn<bool>(
                name: "Hidden",
                table: "Task",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "ModifiedBy",
                table: "Task",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedDate",
                table: "Task",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "timezone('utc', now())");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Task");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "Task");

            migrationBuilder.DropColumn(
                name: "Hidden",
                table: "Task");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Task");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "Task");
        }
    }
}
