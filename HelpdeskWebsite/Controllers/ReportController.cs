using ExercisesWebsite.Reports;
using HelpDeskDAL;
using HelpdeskViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Reflection;
namespace HelpdeskWebsite.Controllers
{
    public class ReportController : Controller
    {
        private readonly IWebHostEnvironment _env;
        public ReportController(IWebHostEnvironment env)
        {
            _env = env;
        }

       

        [Route("api/employeereport")]
        [HttpGet]
        public async Task<IActionResult> GetEmployeeReport()
        {
            try
            {
                string rootpath = _env.WebRootPath;

             
                EmployeeViewModel vm = new();
                var employees = await vm.GetAll(); // async call to DB

           
                EmployeeReport employeeRpt = new EmployeeReport();
                await employeeRpt.GenerateReportAsync(rootpath, employees);

                return Ok(new { msg = "Employee Report Generated" });
            }
            catch (Exception ex)
            {
              Debug.WriteLine("Problem in " + GetType().Name + " " +
              MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
              return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }


        [Route("api/callreport")]
        [HttpGet]
        public async Task<IActionResult> GetCallReport()
        {
            try
            {
                string rootpath = _env.WebRootPath;
                CallViewModel vm = new();
                var calls = await vm.GetAll(); // async call to DB
                CallReport callRpt = new CallReport();
                await callRpt.GenerateCallReport(rootpath, calls);
                return Ok(new { msg = "Call Report Generated" });
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

    }
}
