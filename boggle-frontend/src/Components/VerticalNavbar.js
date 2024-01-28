//Import in all needed hooks and dependencies
import { Link }                from "react-router-dom";

//Import in bootstrap components
import Navbar         from 'react-bootstrap/Navbar';
import Container      from 'react-bootstrap/Container';
import Nav            from 'react-bootstrap/Nav';
import NavDropdown    from 'react-bootstrap/NavDropdown';
import Offcanvas      from 'react-bootstrap/Offcanvas';
//Import all assets
import { HouseFill, BookFill, Table, Pen, Search, Fire, CurrencyDollar, PersonCircle } from 'react-bootstrap-icons';


export default function VerticalNavbar(){
    return(
        <Nav className="justify-content-end flex-grow-1 pe-3" id='verticalNav'>
        <Nav.Link><Link to = "/" relative="path">
           <HouseFill/>
           <span style = {{marginLeft:'10px'}}> Return Home  </span>
          </Link></Nav.Link>
        <Nav.Link><Link to = "/manual" relative="path">
              <BookFill/>
              <span style = {{marginLeft:'10px'}}> User Manual  </span>
        </Link></Nav.Link>
        <Nav.Link><Link to = "/customers/1" relative="path">
              <CurrencyDollar/>
              <span style = {{marginLeft:'10px'}}> Simulate a Purchase </span>
        </Link></Nav.Link>
        <NavDropdown
            title="Products"
            id={`offcanvasNavbarDropdown-expand-false`}
        >
            <NavDropdown.Item>
              <Nav.Link><Link to = "/products" relative="path">
                <Table/>
                <span style = {{marginLeft:'10px'}}>  Browse All Products   </span>
              </Link></Nav.Link>
            </NavDropdown.Item>
            <NavDropdown.Item >
              <Nav.Link><Link to = "/products/new" relative="path">
                <Pen/>
                <span style = {{marginLeft:'10px'}}> Create a New Product   </span>
              </Link></Nav.Link>  
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Nav.Link><Link to = "/products/?searchbar=open" relative="path">
                <Search/>
                <span style = {{marginLeft:'10px'}}> Find a Product  </span>
              </Link></Nav.Link>  
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Nav.Link><Link to = "/reporting/products" relative="path">
                  <Fire/>
                  <span style = {{marginLeft:'10px'}}> See the Hottest Performing Products   </span>
              </Link></Nav.Link> 
            </NavDropdown.Item>
            <NavDropdown.Divider />
              <p className="navbarDropDownDescription"> Products is where you can browse all products offered across all warehouses, see their performances, see where individual products are located and move them, add new products to your system, buy more product, and delete products (will also delete them from all your inventories). </p>
        </NavDropdown>
        <NavDropdown
            title="Warehouses"
            id={`offcanvasNavbarDropdown-expand-false`}
        >
            <NavDropdown.Item>
              <Nav.Link><Link to = "/warehouses" relative="path">
                <Table/>
                <span style = {{marginLeft:'10px'}}>  Browse All Warehouses   </span>
              </Link></Nav.Link>
            </NavDropdown.Item>
            <NavDropdown.Item >
              <Nav.Link><Link to = "/warehouses/new" relative="path">
                <Pen/>
                <span style = {{marginLeft:'10px'}}> Create a New Warehouse   </span>
              </Link></Nav.Link>  
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Nav.Link><Link to = "/products/?searchbar=open" relative="path">
                <Search/>
                <span style = {{marginLeft:'10px'}}> Find a Warehouse  </span>
              </Link></Nav.Link>  
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Nav.Link><Link to = "/reporting/warehouse" relative="path">
                  <Fire/>
                  <span style = {{marginLeft:'10px'}}> See the Hottest Performing Warehouses </span>
              </Link></Nav.Link> 
            </NavDropdown.Item>
            <NavDropdown.Divider />
              <p className="navbarDropDownDescription"> Warehouses is where you can browse all your warehouses and see their associated inventories, see their performances, add and move inventories between warehouses, and delete warehouses. </p>
        </NavDropdown>
        <NavDropdown
            title="Customers"
            id={`offcanvasNavbarDropdown-expand-false`}
        >
            <NavDropdown.Item>
              <Nav.Link><Link to = "/customers" relative="path">
                <Table/>
                <span style = {{marginLeft:'10px'}}>  Browse All Customers   </span>
              </Link></Nav.Link>
            </NavDropdown.Item>
            <NavDropdown.Item >
              <Nav.Link><Link to = "/customers/new" relative="path">
                <Pen/>
                <span style = {{marginLeft:'10px'}}> Create a New Customer   </span>
              </Link></Nav.Link>  
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Nav.Link><Link to = "/customers/?searchbar=open" relative="path">
                <Search/>
                <span style = {{marginLeft:'10px'}}> Find a Customer  </span>
              </Link></Nav.Link>  
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Nav.Link><Link to = "/reporting/customers" relative="path">
                  <Fire/>
                  <span style = {{marginLeft:'10px'}}> See the Most Loyal Customers </span>
              </Link></Nav.Link> 
            </NavDropdown.Item>
            <NavDropdown.Divider />
              <p className="navbarDropDownDescription"> Customers is where you can browse through customers, add or delete them, and see the most loyal customers. By clicking a customer, you can also simulate a purchase.</p>
        </NavDropdown>
        <NavDropdown
            title="Analytics"
            id={`offcanvasNavbarDropdown-expand-false`}
        >
            <NavDropdown.Item>
              <Nav.Link><Link to = "/reporting" relative="path">
                <PersonCircle/>
                <span style = {{marginLeft:'10px'}}> View your Sales Performance</span>
              </Link></Nav.Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Nav.Link><Link to = "/reporting/products" relative="path">
                  <Fire/>
                  <span style = {{marginLeft:'10px'}}> See the Hottest Performing Products </span>
              </Link></Nav.Link> 
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Nav.Link><Link to = "/reporting/warehouses" relative="path">
                  <Fire/>
                  <span style = {{marginLeft:'10px'}}> See the Hottest Performing Warehouses </span>
              </Link></Nav.Link> 
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Nav.Link><Link to = "/reporting/customers" relative="path">
                  <Fire/>
                  <span style = {{marginLeft:'10px'}}> See the Hottest Performing Customers </span>
              </Link></Nav.Link> 
            </NavDropdown.Item>
            <NavDropdown.Divider />
              <p className="navbarDropDownDescription"> Analytics is where you can review your overall expenditures and revenues, and view reporting analytics on hot warehouses, hot customers, and hot products. </p>
        </NavDropdown>
        </Nav>
    )
}