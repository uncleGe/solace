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
          {filteredAdvocates.map((a) => {
            return (
              <tr key={a.id}>                
                <td>{a.firstName}</td>
                <td>{a.lastName}</td>
                <td>{a.city}</td>
                <td>{a.degree}</td>
                <td>
                  <ul>
                    {a.specialties.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </td>
                <td>{a.yearsOfExperience}</td>
                <td>{a.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
