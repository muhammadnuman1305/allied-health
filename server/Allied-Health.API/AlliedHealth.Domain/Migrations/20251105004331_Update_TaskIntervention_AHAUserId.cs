using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class Update_TaskIntervention_AHAUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AhaId",
                table: "TaskIntervention");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AhaId",
                table: "TaskIntervention",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("2364fbbe-d949-4291-96d2-12b6f92f59a7"));
        }
    }
}
