import React, { useState, useEffect }from "react";
import SideBar from "./SideBar";
import axios from "axios";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useNavigate, useLocation } from "react-router-dom";


function FollowUpDetails() {

  const Navigate = useNavigate(); 
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [otherVehicle, setOtherVehicle] = useState('');
  const [vehicleno, setVehicle] = useState([])
  const [revenueStartDate, setRevenueStartDate] = useState(null);
  const [revenueEndDate, setRevenueEndDate] = useState(null);
  const [insuranceStartDate, setInsuranceStartDate] = useState(null);
  const [insuranceEndDate, setInsuranceEndDate] = useState(null);
  const [taxStartDate, setTaxStartDate] = useState(null);
  const [taxEndDate, setTaxEndDate] = useState(null);
  const formattedRevenueStartDate = revenueStartDate ? format(revenueStartDate, 'yyyy-MM-dd') : '';
  const formattedRevenueEndDate = revenueEndDate ? format(revenueEndDate, 'yyyy-MM-dd') : '';
  const formattedInsuranceStartDate = insuranceStartDate ? format(insuranceStartDate, 'yyyy-MM-dd') : '';
  const formattedInsuranceEndDate = insuranceEndDate ? format(insuranceEndDate, 'yyyy-MM-dd') : '';
  const formattedTaxStartDate = taxStartDate ? format(taxStartDate, 'yyyy-MM-dd') : '';
  const formattedTaxEndDate = taxEndDate ? format(taxEndDate, 'yyyy-MM-dd') : '';
  const [taxPayer, setTaxPayer] = useState('');
  const location = useLocation();
    const { username } = location.state || { username: undefined };

    
  const handleVehicleChange = async (event) => {
    const value = event.target.value;
    setSelectedVehicle(value);
    // Clear the text field value if a different option is selected
    if (value && value !== 'other') {
      try {
          const response = await axios.post('http://16.16.167.16:8081/vehicles/vehicleDetails/viewTaxPayer', { vehicleno: value });
          if (response.data.success) {
              setTaxPayer(response.data.vehicle.taxPayer ? "Yes" : "No");
          } else {
              console.error('Failed to fetch taxpayer status:', response.data.error);
          }
      } catch (err) {
          console.error('Error while fetching taxpayer status:', err);
      }
    } else {
        setTaxPayer(''); // Clear taxpayer status if 'other' or no selection
    }
  };

    useEffect(() => {
        // Axios request to fetch data
        axios.post('http://16.16.167.16:8081/vehicles/vehicleDetails/dropdown')
        .then((response) => {
            if (response.data.success) {
                setVehicle(response.data.vehicleno);
            }
        })
        .catch(err => {
            console.log("Error Add DropDown Details", err);
        });
    }, []);

    const submitHandler = (e) => {
      e.preventDefault();

      if (!selectedVehicle || selectedVehicle === "") {
        alert("Please select a vehicle number.");
        return; // Stop the form submission
      }
      
      const vehicleData = {
        vehicleno: selectedVehicle === 'other' ? otherVehicle : selectedVehicle,
        revenueStartDate: formattedRevenueStartDate,
        revenueEndDate: formattedRevenueEndDate,
        insuranceStartDate: formattedInsuranceStartDate,
        insuranceEndDate: formattedInsuranceEndDate,
        taxPayer:taxPayer,
        taxStartDate: formattedTaxStartDate,
        taxEndDate: formattedTaxEndDate
      };
  
      axios.post('http://16.16.167.16:8081/vehicles/followupDetails', vehicleData)
          .then(response => {
              if (response.data.loginStatus) {
                  alert('Vehicle Follow Up Details Added Successfully');
                  reset();
              } else {
                  alert('Failed to add the vehicle:', response.data.error);
              }
          })
          .catch(err => {
              console.error('Error Add Vehicle Follow Up Details:', err.message);
          });
    };

  
    const reset =  () => {
     
      setRevenueStartDate(null);
      setRevenueEndDate(null);
      setInsuranceStartDate(null);
      setInsuranceEndDate(null);
      setTaxPayer('');
      setTaxStartDate(null);
      setTaxEndDate(null);
      setSelectedVehicle('');  
      setOtherVehicle('');  
    }
  
    return(
      <div>
          <SideBar/>
        <form className='followup-form' onSubmit={submitHandler}>
          <div className='followup-vehicle-form'>
            <h2>Vehicle Follow Up Details</h2>
            <div className="journey-dropdown">
                <label htmlFor="vehicleno" name="vehicleno" >Vehicle Number: </label>
                    <select value={selectedVehicle} onChange={handleVehicleChange}>
                    <option value="">Choose Your Vehicle</option>
                    {vehicleno.length > 0 ? (
                        vehicleno.map((number, index) => (
                            <option key={index} value={number}>
                                {number}
                            </option>
                        ))
                    ) : (
                    <option value="" disabled>
                        No Vehicle Numbers Available
                    </option>
                    )}
                    <option value="other">Other</option>
                    </select>
                    {selectedVehicle === 'other' && (
                    <input type="text" value={otherVehicle} onChange={(event) => setOtherVehicle(event.target.value)} placeholder="Enter other vehicle number" />
                    )}
                </div>
                <div className={`form-section ${!selectedVehicle ? 'blur' : ''}`}>
                <div className="label">
            <label>
            Revenue License Valid Period:
            <DatePicker selected={revenueStartDate}  onChange={date => setRevenueStartDate(date)} formatDate="MM/dd/yyyy" showYearDropdown scrollableMonthYearDropdown className="date" maxDate={new Date()} required/>
            <DatePicker selected={revenueEndDate}  onChange={date => setRevenueEndDate(date)} formatDate="MM/dd/yyyy"  showYearDropdown scrollableMonthYearDropdown className="date" minDate={revenueStartDate ? new Date(revenueStartDate.getTime() + 86400000) : null} required/>
          </label>
          </div>
          <div className="label">
          <label>
            Insurance Valid Period:
            <DatePicker selected={insuranceStartDate}  onChange={date => setInsuranceStartDate(date)} formatDate="MM/dd/yyyy"  showYearDropdown scrollableMonthYearDropdown className="date" maxDate={new Date()} required/>
            <DatePicker selected={insuranceEndDate}  onChange={date => setInsuranceEndDate(date)} formatDate="MM/dd/yyyy" showYearDropdown scrollableMonthYearDropdown className="date"  minDate={insuranceStartDate ? new Date(insuranceStartDate.getTime() + 86400000) : null} required/>
          </label>
          </div>
          <label>Tax Payer? 
          <input type="text" value={taxPayer} readOnly />
          </label>
          {taxPayer === 'Yes' && (
          <div className="label">
          <label>
            Tax Valid Period: 
            <DatePicker selected={taxStartDate}  onChange={date => setTaxStartDate(date)} formatDate="MM/dd/yyyy"  showYearDropdown scrollableMonthYearDropdown className="date" maxDate={new Date()} required/>
            <DatePicker selected={taxEndDate}  onChange={date => setTaxEndDate(date)} formatDate="MM/dd/yyyy"  showYearDropdown scrollableMonthYearDropdown className="date"  minDate={revenueStartDate ? new Date(revenueStartDate.getTime() + 86400000) : null} required/>
          </label>
          </div>
          )}
          </div>
          <button className="button-submit" type="submit" >Add Vehicle Follow Up Details</button>

          <button className="button-reset" onClick={reset}>RESET</button>

          <button className="button-back" onClick={() => {Navigate('/admin/home', { state: { username } })}}>BACK</button> 
        
          </div>
        </form>
      </div>
    )


}
export default FollowUpDetails;