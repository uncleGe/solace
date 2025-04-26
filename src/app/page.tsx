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
    <main className="advocates-container">
      <h1 className="text-2xl font-semibold mb-4">Solace Advocates</h1>

      <div className="advocates-search">
        <label htmlFor="search" className="sr-only">
          Search advocates
        </label>
        <input
          id="search"
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Name, city, specialty…"
          className="advocates-input"
        />
        <button onClick={handleReset} className="advocates-reset">
          Reset
        </button>
      </div>

      {error && (
        <div style={{ color: 'red' }}>{error}</div>
      )}
      
      <table className="advocates-table">
        <thead className="advocates-table-head">
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((a) => (
            <tr key={a.id} className="advocates-table-row">             
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
          ))}
        </tbody>
      </table>
    </main>
  );
}
