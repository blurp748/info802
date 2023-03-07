import cors from 'cors'
import express from 'express'

var app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/", (req: any, res: any) => {
  res.json({ message: "Welcome to RouteCost API." });
});

// Un véhicule électrique consomme entre 12 et 20 ( soit 16 en moyenne ) kWh/100 km
// Le prix au kilowattheure est d'environ 0,1582 € TTC.
app.post('/cost', (req, res) => {
    let distance = req.body.distance;
    let cost = distance * 16 / 100 * 0.1582;
    res.send({cost: cost});
})

app.listen(3000, () => { console.log("Server running on port 3000"); });

module.exports = app;