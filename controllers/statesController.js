const State = require('../model/States');
const statesData = require('../data/statesData.json');

// Helper: find static state by code
const findState = (code) => {
    return statesData.find(st => st.code === code.toUpperCase());
};

// GET /states/
const getAllStates = async (req, res) => {
    let states = [...statesData];

    if (req.query.contig === 'true') {
        states = states.filter(st => st.code !== 'AK' && st.code !== 'HI');
    } else if (req.query.contig === 'false') {
        states = states.filter(st => st.code === 'AK' || st.code === 'HI');
    }

    const dbStates = await State.find();

    states = states.map(st => {
        const match = dbStates.find(db => db.stateCode === st.code);
        return {
            ...st, 
            funfacts: match?.funfacts || []
    };
});

    res.json(states);
};

// GET /states/:state
const getState = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const stateInfo = findState(code);

    if (!stateInfo) {
        return res.status(400).json({ message: "Invalid state abbreviation parameter" });
    }

    const dbState = await State.findOne({ stateCode: code }).exec();

    const response = {
        ...stateInfo,
        funfacts: dbState?.funfacts || []
    };

    res.json(response);
};


// GET /states/:state/funfact
const getFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = findState(code);

    if (!state) {
        return res.status(400).json({ message: "Invalid state abbreviation parameter" });
    }

    const dbState = await State.findOne({ stateCode: code }).exec();

    if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    res.json(dbState.funfacts);
};

// GET /states/:state/funfact/random
const getRandomFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = findState(code);

    if (!state) {
        return res.status(400).json({ message: "Invalid state abbreviation parameter" });
    }

    const dbState = await State.findOne({ stateCode: code }).exec();

    if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const randomIndex = Math.floor(Math.random() * dbState.funfacts.length);
    res.json({ funfact: dbState.funfacts[randomIndex] });
};

// GET simple fields
const getCapital = (req, res) => {
    const state = findState(req.params.state);
    if (!state) return res.status(400).json({ message: "Invalid state abbreviation parameter" });

    res.json({ state: state.state, capital: state.capital_city });
};

const getNickname = (req, res) => {
    const state = findState(req.params.state);
    if (!state) return res.status(400).json({ message: "Invalid state abbreviation parameter" });

    res.json({ state: state.state, nickname: state.nickname });
};

const getPopulation = (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = findState(code);

    if (!state) {
        return res.status(400).json({ message: "Invalid state abbreviation parameter" });
    }

    const formatted = state.population.toLocaleString("en-US");

    res.json({
        state: state.state,
        population: formatted
    });
};

const getAdmission = (req, res) => {
    const state = findState(req.params.state);
    if (!state) return res.status(400).json({ message: "Invalid state abbreviation parameter" });

    res.json({ state: state.state, admitted: state.admission_date });
};

// POST /states/:state/funfact
const addFunFacts = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = findState(code);

    if (!state) {
        return res.status(400).json({ message: "Invalid state abbreviation parameter" });
    }

    const { funfacts } = req.body;

    if (!funfacts) {
        return res.status(400).json({ message: "State fun facts value required" });
    }

    if (!Array.isArray(funfacts)) {
        return res.status(400).json({ message: "State fun facts value must be an array" });
    }

    let dbState = await State.findOne({ stateCode: code }).exec();

    if (!dbState) {
        dbState = await State.create({ stateCode: code, funfacts });
    } else {
        dbState.funfacts.push(...funfacts);
        await dbState.save();
    }

    res.status(201).json(dbState);
};

// PATCH /states/:state/funfact
const updateFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = findState(code);

    if (!state) {
        return res.status(400).json({ message: "Invalid state abbreviation parameter" });
    }

    const { index, funfact } = req.body;

    if (index === undefined) {
        return res.status(400).json({ message: "State fun fact index value required" });
    }

    if (!funfact) {
        return res.status(400).json({ message: "State fun fact value required" });
    }

    const dbState = await State.findOne({ stateCode: code }).exec();

    if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const idx = index - 1;

    if (idx < 0 || idx >= dbState.funfacts.length) {
        return res.status(404).json({ message: `No Fun Fact found at that index for ${state.state}` });
    }

    dbState.funfacts[idx] = funfact;
    await dbState.save();

    res.json(dbState);
};

// DELETE /states/:state/funfact
const deleteFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = findState(code);

    if (!state) {
        return res.status(400).json({ message: "Invalid state abbreviation parameter" });
    }

    const { index } = req.body;

    if (index === undefined) {
        return res.status(400).json({ message: "State fun fact index value required" });
    }

    const dbState = await State.findOne({ stateCode: code }).exec();

    if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const idx = index - 1;

    if (idx < 0 || idx >= dbState.funfacts.length) {
        return res.status(404).json({ message: `No Fun Fact found at that index for ${state.state}` });
    }

    dbState.funfacts.splice(idx, 1);
    await dbState.save();

    res.json(dbState);
};

module.exports = {
    getAllStates,
    getState,
    getFunFact,
    getRandomFunFact,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    addFunFacts,
    updateFunFact,
    deleteFunFact
};
