"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import debounce from "lodash/debounce"; 
import type { Advocate } from "../types/advocate";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [query, setQuery] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);


    const debouncedSetSearch = useRef(
      debounce((val: string) => {
        setSearchTerm(val);
      }, 300)
    ).current;
  
    useEffect(() => {
      (async () => {
        try {
          const res = await fetch("/api/advocates");
          if (!res.ok) throw new Error("Network response not OK");
          const json = await res.json();
          setAdvocates(json.data);
        } catch (error) {
          console.error(error);
          setError("Failed to load advocates. Please try again.");
        }
      })();
  
      return () => {
        debouncedSetSearch.cancel();
      };
    }, [debouncedSetSearch]);
  
    const filteredAdvocates = useMemo(() => {
      if (!searchTerm) return advocates;
      const q = searchTerm.toLowerCase();
      return advocates.filter((a) => {
        return (
          a.firstName.toLowerCase().includes(q) ||
          a.lastName.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.degree.toLowerCase().includes(q) ||
          a.yearsOfExperience.toString().includes(q) ||
          a.specialties.some((s) => s.toLowerCase().includes(q))
        );
      });
    }, [advocates, searchTerm]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      debouncedSetSearch(e.target.value);
    };
  
    const handleReset = () => {
      debouncedSetSearch.cancel();
      setQuery("");
      setSearchTerm("");
    };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term"></span>
        </p>
        <input 
          style={{ border: "1px solid black" }} 
          value={query}
          onChange={handleChange}
          placeholder="Search advocates..."
        />
        <button onClick={handleReset}>Reset Search</button>
      </div>
      <br />
      <br />

      {error && (
        <div style={{ color: 'red' }}>{error}</div>
      )}
      
      <table>
        <thead>
          <th>First Name</th>
          <th>Last Name</th>
          <th>City</th>
          <th>Degree</th>
          <th>Specialties</th>
          <th>Years of Experience</th>
          <th>Phone Number</th>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => {
            return (
              <tr>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map((s) => (
                    <div>{s}</div>
                  ))}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
