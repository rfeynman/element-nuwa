# Iron–oxygen interaction correction

The 1.2.0 screenshot reproduced a metadata and interaction bug: both iron oxide records demanded an oxygen atmosphere in addition to explicit O2 reactant. The source page https://www.webelements.com/iron/chemistry.html (checked 2026-11-20 UTC, Reaction of iron with air) states that heating iron with O2 yields Fe2O3 and Fe3O4, without imposing a distinct pure-oxygen background requirement.

The merger now removes that redundant restriction only for the two iron oxide records. It preserves heat, explicit O2, exact ingredient matching, product states, and source links. Other separately sourced atmosphere requirements (such as pure-oxygen peroxide examples) stay enforced. Both oxide equations are selected teaching endpoints, not a claim of unique products or the formula of ordinary hydrated rust. No reaction or experimental procedure was invented.

Multiple eligible outcomes now return structured choices and appear beside the vessel. Selecting a choice runs that exact scenario. Example loading preselects its stated activation/atmosphere. Missing-condition results offer an explicit Apply these conditions & react button.

266 application tests and production build pass. The regression case covers Fe/O2 + heat + air, both oxide endpoints, required heating, exact inputs, and stable choice order. Local browser checks reproduced manual table selection, Fe3O4 production, recovery from missing heat, and magnesium example condition presets; no browser errors.
