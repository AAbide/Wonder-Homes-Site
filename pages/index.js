import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import emailjs from "@emailjs/browser";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDLBu5Qyn-LLsKhVqeer09SF4E_mbrHocM",
  authDomain: "wonder-homes-1f264.firebaseapp.com",
  projectId: "wonder-homes-1f264",
  storageBucket: "wonder-homes-1f264.appspot.com",
  messagingSenderId: "614501014223",
  appId: "1:614501014223:web:2b342a984a2889155cf5ba",
  measurementId: "G-TM8JGJK13Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    checkin: "",
    checkout: "",
    guests: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [loginDetails, setLoginDetails] = useState({ username: "", password: "" });

  const handleLoginChange = (e) => {
    setLoginDetails({ ...loginDetails, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginDetails.username === "admin" && loginDetails.password === "wonderhomes2024") {
      setAdminLoggedIn(true);
    } else {
      alert("Incorrect credentials");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const calculateDuration = (start, end) => {
      const checkin = new Date(start);
      const checkout = new Date(end);
      const diffTime = Math.abs(checkout - checkin);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} night${diffDays > 1 ? "s" : ""}`;
    };
    try {
      await addDoc(collection(db, "bookings"), formData);
      await emailjs.send("service_sjaegrf", "template_hfi2cp5", {
        ...formData,
        duration: calculateDuration(formData.checkin, formData.checkout),
        host_contact: "+234 706 698 1205"
      }, "FcaZ8DT3Ax7z3JN2-");
      setSubmitted(true);
      fetchBookings();
    } catch (error) {
      console.error("Error submitting booking:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-serif">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome to Wonder Homes</h1>
        {submitted ? (
          <p className="text-green-600">Booking submitted successfully!</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 mb-8">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
            <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <Input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
            <Input name="checkin" type="date" value={formData.checkin} onChange={handleChange} />
            <Input name="checkout" type="date" value={formData.checkout} onChange={handleChange} />
            <Input name="guests" type="number" placeholder="Number of guests" value={formData.guests} onChange={handleChange} />
            <Button type="submit">Submit Booking</Button>
          </form>
        )}

        <hr className="my-8" />

        <section id="admin">
          <h2 className="text-2xl font-semibold mb-4">Admin Panel</h2>
          {!adminLoggedIn ? (
            <form onSubmit={handleLogin} className="grid gap-3 max-w-sm">
              <Input name="username" placeholder="Username" value={loginDetails.username} onChange={handleLoginChange} />
              <Input name="password" type="password" placeholder="Password" value={loginDetails.password} onChange={handleLoginChange} />
              <Button type="submit">Login</Button>
            </form>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-2">Booking Records</h3>
              {bookings.map((b) => (
                <Card key={b.id} className="mb-2">
                  <CardContent>
                    <p><strong>Name:</strong> {b.name}</p>
                    <p><strong>Email:</strong> {b.email}</p>
                    <p><strong>Phone:</strong> {b.phone}</p>
                    <p><strong>Check-in:</strong> {b.checkin}</p>
                    <p><strong>Check-out:</strong> {b.checkout}</p>
                    <p><strong>Guests:</strong> {b.guests}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ✅ Required: default export so Vercel knows this is your homepage
export default Home;
