using ExercisesDAL;
using HelpDeskDAL;
using System.Linq;
using Xunit.Abstractions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CasestudyTests
{
    public class DAOTests
    {
        private readonly ITestOutputHelper output;
        public DAOTests(ITestOutputHelper output)
        {
            this.output = output;
        }



        [Fact]
        public async Task Employee_GetByEmailTest()
        {

            EmployeeDAO dao = new();
            Employee selectedEmployee = await dao.GetByEmail("bs@abc.com");
            Assert.NotNull(selectedEmployee);
        }

        [Fact]
        public async Task Employee_GetByIDTest()
        {
            EmployeeDAO dao = new();
            Employee selectedEmployee = await dao.GetById(3);
            Assert.NotNull(selectedEmployee);

        }

        [Fact]
        public async Task Employee_GetAllTest()
        {
            EmployeeDAO dao = new();
            List<Employee> allEmployees = await dao.GetAll();
            Assert.True(allEmployees.Count > 0);
        }

        [Fact]
        public async Task Employee_AddTest()
        {
            EmployeeDAO dao = new();
            Employee newEmployee = new()
            {
                FirstName = "Lucca",
                LastName = "Prada",
                PhoneNo = "(226)2332121",
                Title = "Mr.",
                DepartmentId = 100,
                Email = "l_prada@fanshaweonline.ca"
            };

            Assert.True(await dao.Add(newEmployee) > 0);
        }

        [Fact]
        public async Task Employee_UpdateTest()
        {
            EmployeeDAO dao = new();
            Employee? employeeForUpdate = await dao.GetById(3);
            if (employeeForUpdate != null)
            {
                string oldPhoneNo = employeeForUpdate.PhoneNo!;
                string newPhoneNo = oldPhoneNo == "519-555-1234" ? "555-555-5555" : "519-555-1234";
                employeeForUpdate!.PhoneNo = newPhoneNo;
            }
            Assert.True(await dao.Update(employeeForUpdate!) == UpdateStatus.Ok);
        }

        [Fact]
        public async Task Employee_DeleteTest()
        {
            EmployeeDAO dao = new();
            Employee? employeeToDelete = await dao.GetById(2);
            Assert.True(await dao.Delete(employeeToDelete.Id) == 1);
        }

        [Fact]
        public async Task Employee_GetByPhoneNumber()
        {
            EmployeeDAO dao = new();
            Employee selectedEmployee = await dao.GetByPhoneNumber("(226)5088000");
            Assert.NotNull(selectedEmployee);

        }

        [Fact]
        public async Task Employee_ConcurrencyTest()
        {
            EmployeeDAO dao1 = new();
            EmployeeDAO dao2 = new();
            Employee employeeForUpdate1 = await dao1.GetByLastname("Prada");
            Employee employeeForUpdate2 = await dao2.GetByLastname("Prada");
            if (employeeForUpdate1 != null)
            {
                string? oldPhoneNo = employeeForUpdate1.PhoneNo;
                string? newPhoneNo = oldPhoneNo == "519-555-1234" ? "555-555-5555" : "519-555-1234";
                employeeForUpdate1.PhoneNo = newPhoneNo;
                if (await dao1.Update(employeeForUpdate1) == UpdateStatus.Ok)
                {
                    // need to change the phone # to something else
                    employeeForUpdate2.PhoneNo = "666-666-6668";
                    Assert.True(await dao2.Update(employeeForUpdate2) == UpdateStatus.Stale);
                }
                else
                    Assert.True(false); // first update failed
            }
            else
                Assert.True(false); // didn't find employee 1
        }

        [Fact]
        public async Task Employee_LoadPicsTest()
        {
            {
                PicsUtility util = new();
                Assert.True(await util.AddEmployeePicsToDb());
            }
        }

        [Fact]
        public async Task Employee_ComprehensiveTest()
        {
            EmployeeDAO dao = new();
            Employee newEmployee = new()
            {
                FirstName = "Joe",
                LastName = "Smith",
                PhoneNo = "(555)555-1234",
                Title = "Mr.",
                DepartmentId = 100,
                Email = "js@abc.com"
            };
            int newEmployeeId = await dao.Add(newEmployee);
            output.WriteLine("New Employee Generated - Id = " + newEmployeeId);
            newEmployee = await dao.GetById(newEmployeeId);
            byte[] oldtimer = newEmployee.Timer!;
            output.WriteLine("New Employee " + newEmployee.Id + " Retrieved");
            newEmployee.PhoneNo = "(555)555-1233";
            if (await dao.Update(newEmployee) == UpdateStatus.Ok)
            {
                output.WriteLine("Employee " + newEmployeeId + " phone# was updated to -   " + newEmployee.PhoneNo);
            }
            else
            {
                output.WriteLine("Employee " + newEmployeeId + " phone# was not updated!");
            }
            newEmployee.Timer = oldtimer; // to simulate another user
            newEmployee.PhoneNo = "doesn't matter data is stale now";
            if (await dao.Update(newEmployee) == UpdateStatus.Stale)
            {
                output.WriteLine("Employee " + newEmployeeId + " was not updated due to stale data");
            }

            dao = new();
            await dao.GetById(newEmployeeId);
            if (await dao.Delete(newEmployeeId) == 1)
            {
                output.WriteLine("Employee " + newEmployeeId + " was deleted!");
            }
            else
            {
                output.WriteLine("Employee " + newEmployeeId + " was not deleted");
            }
            // should be null because it was just deleted
            Assert.Null(await dao.GetById(newEmployeeId));
        }

        [Fact]
        public async Task Call_ComprehensiveDAOTest()
        {
            CallDAO cdao = new();
            EmployeeDAO edao = new();
            ProblemDAO pdao = new();
            var employee = await edao.GetByLastname("Prada");
            var tech = await edao.GetByLastname("Burner");
            var problem = await pdao.GetByDescription("Hard Drive Failure");
                       
            Call newCall = new()
            {
                EmployeeId = employee.Id,
                TechId = tech.Id,
                ProblemId = problem!.Id,
                DateOpened = DateTime.Now,
                DateClosed = null,
                OpenStatus = true,
                Notes = "Prada’s drive is shot, Burner to fix it"
            };

            
            int newCallId = await cdao.Add(newCall);
            output.WriteLine("New Call Added - Id = " + newCallId);
                     
            Call call = await cdao.GetById(newCallId);
            output.WriteLine("Retrieved Call " + newCallId);
            
            
            call.Notes += "\n Ordered new drive!";
            if (await cdao.Update(call) == UpdateStatus.Ok)
                output.WriteLine("Call " + newCallId + " was updated:" + call.Notes);
            else
                output.WriteLine("Call " + newCallId + " update failed");

        
            if (await cdao.Update(call) == UpdateStatus.Stale)
                output.WriteLine("Call " + newCallId + " was not updated due to stale data");
            
         
            if (await cdao.Delete(newCallId) == 1)
                output.WriteLine("Deleted Call " + newCallId + " successfully");
            else
                output.WriteLine("Call " + newCallId + " deletion failed");

            
            var deletedCall = await cdao.GetById(newCallId);
            Assert.Null(deletedCall);
        }



    }
}
