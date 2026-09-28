# 6. Relational Database Schema (3NF)
## Agriculture Resource and Farm Management System (AgriPulse)

---

### Formal Relational Schema Definition

#### 1. `roles`
$$\text{roles}(\underline{\text{role\_id}}, \text{role\_name}^\text{UK}, \text{description}, \text{created\_at})$$

#### 2. `users`
$$\text{users}(\underline{\text{user\_id}}, \text{name}, \text{email}^\text{UK}, \text{password\_hash}, \text{phone}, \text{role\_id}^\text{FK}, \text{is\_active}, \text{created\_at}, \text{updated\_at})$$
- $\text{FK: } \text{users.role\_id} \to \text{roles.role\_id}$
- $\text{CHECK: } \text{email matches standard regex}$

#### 3. `farms`
$$\text{farms}(\underline{\text{farm\_id}}, \text{owner\_id}^\text{FK}, \text{farm\_name}, \text{location}, \text{area}, \text{soil\_type}, \text{ownership\_type}, \text{status}, \text{created\_at}, \text{updated\_at})$$
- $\text{FK: } \text{farms.owner\_id} \to \text{users.user\_id} \text{ (ON DELETE CASCADE)}$
- $\text{CHECK: } \text{area} > 0$
- $\text{CHECK: } \text{status} \in \{\text{'ACTIVE'}, \text{'INACTIVE'}, \text{'LEASED'}, \text{'FALLOW'}\}$

#### 4. `fields`
$$\text{fields}(\underline{\text{field\_id}}, \text{farm\_id}^\text{FK}, \text{field\_name}, \text{area}, \text{soil\_type}, \text{irrigation\_type}, \text{created\_at})$$
- $\text{FK: } \text{fields.farm\_id} \to \text{farms.farm\_id} \text{ (ON DELETE CASCADE)}$
- $\text{CHECK: } \text{area} > 0$
- $\text{CHECK: } \text{irrigation\_type} \in \{\text{'DRIP'}, \text{'SPRINKLER'}, \text{'FLOOD'}, \text{'CANAL'}, \text{'MANUAL'}, \text{'RAINFED'}\}$

#### 5. `crops`
$$\text{crops}(\underline{\text{crop\_id}}, \text{crop\_name}^\text{UK}, \text{scientific\_name}, \text{category}, \text{standard\_maturity\_days}, \text{water\_requirement}, \text{optimal\_soil}, \text{created\_at})$$
- $\text{CHECK: } \text{category} \in \{\text{'CEREAL'}, \text{'PULSE'}, \text{'VEGETABLE'}, \text{'FRUIT'}, \text{'CASH\_CROP'}, \text{'OILSEED'}, \text{'HORTICULTURE'}\}$
- $\text{CHECK: } \text{standard\_maturity\_days} > 0$

#### 6. `crop_cycles`
$$\text{crop\_cycles}(\underline{\text{cycle\_id}}, \text{field\_id}^\text{FK}, \text{crop\_id}^\text{FK}, \text{sowing\_date}, \text{expected\_harvest\_date}, \text{actual\_harvest\_date}, \text{status}, \text{target\_yield\_kg}, \text{notes}, \text{created\_at}, \text{updated\_at})$$
- $\text{FK: } \text{crop\_cycles.field\_id} \to \text{fields.field\_id} \text{ (ON DELETE RESTRICT)}$
- $\text{FK: } \text{crop\_cycles.crop\_id} \to \text{crops.crop\_id} \text{ (ON DELETE RESTRICT)}$
- $\text{CHECK: } \text{expected\_harvest\_date} \ge \text{sowing\_date}$
- $\text{CHECK: } \text{status} \in \{\text{'PLANNED'}, \text{'ACTIVE'}, \text{'HARVESTED'}, \text{'COMPLETED'}, \text{'CANCELLED'}\}$

#### 7. `crop_status_history`
$$\text{crop\_status\_history}(\underline{\text{history\_id}}, \text{cycle\_id}^\text{FK}, \text{previous\_status}, \text{new\_status}, \text{changed\_at}, \text{remarks})$$
- $\text{FK: } \text{crop\_status\_history.cycle\_id} \to \text{crop\_cycles.cycle\_id} \text{ (ON DELETE CASCADE)}$

#### 8. `farming_activities`
$$\text{farming\_activities}(\underline{\text{activity\_id}}, \text{cycle\_id}^\text{FK}, \text{field\_id}^\text{FK}, \text{activity\_date}, \text{activity\_type}, \text{description}, \text{labour\_hours}, \text{cost}, \text{created\_at})$$
- $\text{FK: } \text{farming\_activities.cycle\_id} \to \text{crop\_cycles.cycle\_id} \text{ (ON DELETE CASCADE)}$
- $\text{FK: } \text{farming\_activities.field\_id} \to \text{fields.field\_id} \text{ (ON DELETE CASCADE)}$
- $\text{CHECK: } \text{activity\_type} \in \{\text{'PLOUGHING'}, \text{'SOWING'}, \text{'FERTILIZER\_APPLICATION'}, \text{'IRRIGATION'}, \text{'PEST\_CONTROL'}, \dots\}$
- $\text{CHECK: } \text{labour\_hours} \ge 0, \text{cost} \ge 0$

#### 9. `resources`
$$\text{resources}(\underline{\text{resource\_id}}, \text{resource\_name}, \text{category}, \text{unit}, \text{purchase\_price}, \text{available\_quantity}, \text{minimum\_stock}, \text{supplier}, \text{purchase\_date}, \text{created\_at}, \text{updated\_at})$$
- $\text{CHECK: } \text{category} \in \{\text{'FERTILIZER'}, \text{'PESTICIDE'}, \text{'SEED'}, \text{'EQUIPMENT'}, \text{'FUEL'}, \text{'PACKAGING'}, \text{'OTHER'}\}$
- $\text{CHECK: } \text{available\_quantity} \ge 0, \text{minimum\_stock} \ge 0, \text{purchase\_price} \ge 0$

#### 10. `fertilizer_usages`
$$\text{fertilizer\_usages}(\underline{\text{usage\_id}}, \text{cycle\_id}^\text{FK}, \text{resource\_id}^\text{FK}, \text{field\_id}^\text{FK}, \text{application\_date}, \text{quantity\_applied}, \text{cost}, \text{application\_method}, \text{notes}, \text{created\_at})$$
- $\text{FK: } \text{fertilizer\_usages.cycle\_id} \to \text{crop\_cycles.cycle\_id} \text{ (ON DELETE CASCADE)}$
- $\text{FK: } \text{fertilizer\_usages.resource\_id} \to \text{resources.resource\_id} \text{ (ON DELETE RESTRICT)}$
- $\text{FK: } \text{fertilizer\_usages.field\_id} \to \text{fields.field\_id} \text{ (ON DELETE CASCADE)}$
- $\text{CHECK: } \text{quantity\_applied} > 0, \text{cost} \ge 0$

#### 11. `irrigation_records`
$$\text{irrigation\_records}(\underline{\text{irrigation\_id}}, \text{cycle\_id}^\text{FK}, \text{field\_id}^\text{FK}, \text{irrigation\_date}, \text{water\_quantity\_liters}, \text{duration\_minutes}, \text{irrigation\_method}, \text{notes}, \text{created\_at})$$
- $\text{FK: } \text{irrigation\_records.cycle\_id} \to \text{crop\_cycles.cycle\_id} \text{ (ON DELETE CASCADE)}$
- $\text{FK: } \text{irrigation\_records.field\_id} \to \text{fields.field\_id} \text{ (ON DELETE CASCADE)}$
- $\text{CHECK: } \text{water\_quantity\_liters} > 0, \text{duration\_minutes} > 0$

#### 12. `expenses`
$$\text{expenses}(\underline{\text{expense\_id}}, \text{farm\_id}^\text{FK}, \text{cycle\_id}^\text{FK}, \text{expense\_date}, \text{category}, \text{amount}, \text{payment\_mode}, \text{receipt\_number}, \text{description}, \text{created\_at})$$
- $\text{FK: } \text{expenses.farm\_id} \to \text{farms.farm\_id} \text{ (ON DELETE CASCADE)}$
- $\text{FK: } \text{expenses.cycle\_id} \to \text{crop\_cycles.cycle\_id} \text{ (ON DELETE SET NULL)}$
- $\text{CHECK: } \text{amount} \ge 0$

#### 13. `harvests`
$$\text{harvests}(\underline{\text{harvest\_id}}, \text{cycle\_id}^\text{FK}, \text{harvest\_date}, \text{quantity\_kg}, \text{unit}, \text{quality\_grade}, \text{selling\_price\_per\_unit}, \text{total\_revenue}, \text{buyer\_name}, \text{notes}, \text{created\_at})$$
- $\text{FK: } \text{harvests.cycle\_id} \to \text{crop\_cycles.cycle\_id} \text{ (ON DELETE RESTRICT)}$
- $\text{CHECK: } \text{quantity\_kg} > 0, \text{selling\_price\_per\_unit} \ge 0, \text{total\_revenue} \ge 0$
