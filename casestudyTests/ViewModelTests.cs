using HelpDeskDAL;
using HelpdeskViewModels;
using Microsoft.VisualStudio.TestPlatform.Utilities;
using Xunit.Abstractions;

namespace CasestudyTests
{
    public class ViewModelTests
    {

        private readonly ITestOutputHelper output;
        public ViewModelTests(ITestOutputHelper output)
        {
            this.output = output;
        }

        [Fact]
        public async Task Employee_GetByPhoneNoTest()
        {
            EmployeeViewModel vm = new() { Phoneno = "(777)777-7777" };
            await vm.GetByPhoneNo();
            Assert.True(vm.Id > 0);
        }

        [Fact]
        public async Task Employeet_Add()
        {
           EmployeeViewModel vm;
            vm = new()
            {
                Title = "Mr.",
                Firstname = "Lucca",
                Lastname = "Prada",
                Email = "l_prada@fanshaweonline.ca",
                Phoneno = "(777)777-7777",
                DepartmentId = 100 
            };
            await vm.Add();
            Assert.True(vm.Id > 0);

        }
        [Fact]
        public async Task Employee_Update()
        {
            EmployeeViewModel vm = new() { Phoneno = "(777)777-7777" };
            await vm.GetByPhoneNo(); 
            vm.Email = vm.Email == "some@abc.com" ? "some@abc.com1" : "some@abc.com2";
           Assert.True(await vm.Update() == 1);
        }

        [Fact]
        public async Task Employee_Delete()
        {
            EmployeeViewModel vm = new() { Phoneno = "(777)777-7777" };
            await vm.GetByPhoneNo();
            Assert.True(await vm.Delete() == 1); 

        }

        [Fact]
        public async Task Employee_GetAll()
        {
            List<EmployeeViewModel> allEmployeeVms;
            EmployeeViewModel vm = new();
            allEmployeeVms = await vm.GetAll();
            Assert.True(allEmployeeVms.Count > 0);

        }

        [Fact]
        public async Task Employee_GetByID()
        {
            EmployeeViewModel vm = new() { Id = 1 };
            await vm.GetByID();
            Assert.NotNull(vm.Firstname);
        }

        [Fact]
        public async Task Employee_GetByEmail()
        {
            EmployeeViewModel vm = new() { Email = "some@abc.com1" };
            await vm.GetByEmail();
            Assert.True(vm.Id > 0);
        }
        
        [Fact]
        public async Task Employee_ComprehensiveVMTest()
        {
            EmployeeViewModel evm = new()
            {
                Title = "Mr.",
                Firstname = "Some",
                Lastname = "Employee",
                Email = "some@abc.com",
                Phoneno = "(777)777-7777",
                DepartmentId = 100 // ensure department id is in Departments table
            };
            await evm.Add();
            output.WriteLine("New Employee Added - Id = " + evm.Id);
            int? id = evm.Id; // need id for delete later
            await evm.GetByID();
            output.WriteLine("New Employee " + id + " Retrieved");
            evm.Phoneno = "(555)555-1233";
            if (await evm.Update() == 1)
            {
                output.WriteLine("Employee " + id + " phone# was updated to - " +
               evm.Phoneno);
            }
            else
            {
                output.WriteLine("Employee " + id + " phone# was not updated!");
            }
            evm.Phoneno = "Another change that should not work";
            if (await evm.Update() == -2)
            {
                output.WriteLine("Employee " + id + " was not updated due to stale data");
            }
            evm = new EmployeeViewModel
            {
                Id = id
            };
            // need to reset because of concurrency error
            await evm.GetByID();
            if (await evm.Delete() == 1)
            {
                output.WriteLine("Employee " + id + " was deleted!");
            }
            else
            {
                output.WriteLine("Employee " + id + " was not deleted");
            }
            // should throw expected exception
            Task<NullReferenceException> ex = Assert.ThrowsAsync<NullReferenceException>(async ()
           => await evm.GetByID());
        }

        [Fact]
        public async Task Call_ComprehensiveVMTest()
        {
            EmployeeDAO edao = new();
            ProblemDAO pdao = new();

            var employee = await edao.GetByLastname("Prada");
            var tech = await edao.GetByLastname("Burner");
            var problem = await pdao.GetByDescription("Memory Upgrade");

            CallViewModel cvm = new()
            {
                EmployeeId = employee.Id,
                TechId = tech.Id,
                ProblemId = problem!.Id,
                DateOpened = DateTime.Now,
                DateClosed = null,
                OpenStatus = true,
                Notes = "Lucca doesnt have good ram, burner to fix"
            };

            await cvm.Add();
            output.WriteLine("New Call Added - Id = " + cvm.Id);

            int id = cvm.Id;
            await cvm.GetById();
            output.WriteLine("Retrieved Call " + id);

            cvm.Notes += "\n Ordered new RAM!";
            if (await cvm.Update() == 1)
            {
                output.WriteLine("Call " + id + " updated: " + cvm.Notes);
            }
            else
            {
                output.WriteLine("Call " + id + " notes update failed!");
            }

            cvm.Notes = "Error 404: notes not found";
            if (await cvm.Update() == -2)
            {
                output.WriteLine("Call " + id + " was not updated due to stale data");
            }

            cvm = new CallViewModel
            {
                Id = id
            };
            await cvm.GetById();


            if (await cvm.Delete() == 1)
            {
                output.WriteLine("Call " + id + " was deleted!");
            }
            else
            {
                output.WriteLine("Call " + id + " was not deleted");
            }


            cvm = new CallViewModel { Id = id };
            Task<NullReferenceException> ex = Assert.ThrowsAsync<NullReferenceException>(async () => await cvm.GetById());
        }








    }
}
