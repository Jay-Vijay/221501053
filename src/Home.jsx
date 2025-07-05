// Home.jsx
import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./Home.css";
import send from './icons/send.png';
import copyicon from './icons/copy.png';
import copiedicon from './icons/copied.png';

function Home() {
  const [inputs, setInputs] = useState([{ url: "", validity: "", shortcode: "" }]);
  const [results, setResults] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...inputs];
    updated[index][name] = value;
    setInputs(updated);
  };

  const addInput = () => {
    setInputs([...inputs, { url: "", validity: "", shortcode: "" }]);
  };

  const removeInput = (index) => {
    const updated = [...inputs];
    updated.splice(index, 1);
    setInputs(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newResults = [];

    for (const input of inputs) {
      if (!input.url.trim()) continue;

      const body = {
        long_url: input.url,
        domain: "bit.ly",
      };

      if (input.shortcode) body.custom_bitlink = `bit.ly/${input.shortcode}`;
      if (input.validity) body.expiry = `PT${parseInt(input.validity)}M`;

      try {
        const res = await fetch("https://api-ssl.bitly.com/v4/shorten", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_BITLY_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!data.link) {
          console.error("Bitly error:", data);
          continue;
        }

        const new_link = data.link.replace("https://", "");
        const qrRes = await fetch(
          `https://api-ssl.bitly.com/v4/bitlinks/${new_link}/qr?image_format=png`,
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_BITLY_TOKEN}`,
            },
          }
        );
        const qrBlob = await qrRes.blob();
        const qrCodeUrl = URL.createObjectURL(qrBlob);

        const result = {
          link: data.link,
          qr_code: qrCodeUrl,
          created_at: new Date(),
          expiry: body.expiry ?? null,
          clicks: 0,
          origin: window.location.href,
          location: "India (Simulated)",
        };

        newResults.push(result);
      } catch (err) {
        console.error("Shortening failed:", err);
      }
    }

    const existing = JSON.parse(sessionStorage.getItem("short_links") || "[]");
    sessionStorage.setItem("short_links", JSON.stringify([...existing, ...newResults]));

    setResults(newResults);
    setInputs([{ url: "", validity: "", shortcode: "" }]);
  };

  return (
    <div className="App">
      <h2>Flexible Bitly Shortener</h2>
      <form className="url_form" onSubmit={handleSubmit}>
        {inputs.map((input, idx) => (
          <div className="input_group" key={idx}>
            <input
              type="text"
              name="url"
              placeholder="Enter URL"
              value={input.url}
              onChange={(e) => handleChange(idx, e)}
              required
            />
            <input
              type="number"
              name="validity"
              placeholder="Validity (mins)"
              value={input.validity}
              onChange={(e) => handleChange(idx, e)}
            />
            <input
              type="text"
              name="shortcode"
              placeholder="Shortcode"
              value={input.shortcode}
              onChange={(e) => handleChange(idx, e)}
            />
            {inputs.length > 1 && (
              <button type="button" onClick={() => removeInput(idx)} className="remove_btn">✖</button>
            )}
          </div>
        ))}
        <div className="btns_row">
          <button type="button" onClick={addInput} className="add_btn">+ Add More</button>
          <button type="submit" className="submit_btn">
            <img src={send} alt="send" id="send_icon" />
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="show_links">
          <h3>Shortened Links</h3>
          {results.map((res, i) => (
            <div key={i} className="result_card">
              <img src={res.qr_code} alt="QR" className="qr_img" />
              <div className="link_text">
                <p>{res.link}</p>
                <CopyToClipboard text={res.link} onCopy={() => setCopiedIndex(i)}>
                  {copiedIndex === i
                    ? <img src={copiedicon} alt="Copied" width="17" height="17" />
                    : <img src={copyicon} alt="Copy" width="17" height="17" />}
                </CopyToClipboard>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
