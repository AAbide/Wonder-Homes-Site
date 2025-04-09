import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import emailjs from "@emailjs/browser";

const firebaseConfig = {
  apiKey: "AIzaSyDLBu5Qyn-LLsKhVqeer09SF4E_mbrHocM",
  authDomain: "wonder-homes-1f264.firebaseapp.com",
  projectId: "wonder-homes-1f264",
  storageBucket: "wonder-homes-1f264.firebasestorage.app",
  messagingSenderId: "614501014223",
  appId: "1:614501014223:web:2b342a984a2889155cf5ba",
  measurementId: "G-TM8JGJK13Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function downloadCSV(data) {
  const csvRows = [
    ["Name", "Email", "Phone", "Check-in", "Check-out", "Guests"],
    ...data.map((b) => [b.name, b.email, b.phone, b.checkin, b.checkout, b.guests])
  ];
  const csvContent = csvRows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", "bookings.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function Home() {
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
    const calculateDuration = (start, end) => {
      const checkin = new Date(start);
      const checkout = new Date(end);
      const diffTime = Math.abs(checkout - checkin);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} night${diffDays > 1 ? 's' : ''}`;
    };
    e.preventDefault();
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
    <>
      <Head>
        <title>Wonder Homes – Book Luxury Shortlets</title>
        <meta name="description" content="Luxury shortlet apartments in serene locations. Book elegance, comfort & unforgettable stays with Wonder Homes." />
        <meta name="keywords" content="Wonder Homes, shortlet, Lagos shortlet, luxury apartments, Airbnb Nigeria, Airbnb, premium stays, vacation homes" />
        <meta property="og:title" content="Wonder Homes – Book Luxury Shortlets" />
        <meta property="og:description" content="Experience top-tier shortlet apartments. Book comfort, elegance, and unforgettable stays with Wonder Homes." />
        <meta property="og:image" content="https://wonder-homes.vercel.app/assets/preview.jpg" />
        <meta property="og:url" content="https://wonder-homes.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-white text-gray-900 font-serif">
        <section id="admin" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-8">Admin Panel: Booking Records</h3>

            {!adminLoggedIn ? (
              <form onSubmit={handleLogin} className="max-w-sm mx-auto bg-white shadow-md p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4 text-center">Login to View Bookings</h4>
                <Input name="username" placeholder="Username" value={loginDetails.username} onChange={handleLoginChange} className="mb-4" />
                <Input name="password" type="password" placeholder="Password" value={loginDetails.password} onChange={handleLoginChange} className="mb-4" />
                <Button type="submit" className="w-full">Login</Button>
              </form>
            ) : (
              <>
                <div className="mb-4 text-right">
                  <Button onClick={() => downloadCSV(bookings)} className="bg-gray-800 text-white px-4 py-2 rounded-xl">Download as CSV</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Phone</th>
                        <th className="px-4 py-2">Check-in</th>
                        <th className="px-4 py-2">Check-out</th>
                        <th className="px-4 py-2">Guests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-t">
                          <td className="px-4 py-2">{b.name}</td>
                          <td className="px-4 py-2">{b.email}</td>
                          <td className="px-4 py-2">{b.phone}</td>
                          <td className="px-4 py-2">{b.checkin}</td>
                          <td className="px-4 py-2">{b.checkout}</td>
                          <td className="px-4 py-2">{b.guests}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
