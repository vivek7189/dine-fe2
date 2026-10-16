// Text content for /tools/tip-pooling-calculator, shared by the page and its FAQPage JSON-LD.

export const ROLES = [
  ['server', 'Server', 1],
  ['bartender', 'Bartender', 1],
  ['busser', 'Busser', 0.5],
  ['runner', 'Food runner', 0.5],
  ['host', 'Host', 0.4],
  ['barback', 'Barback', 0.5],
  ['kitchen', 'Kitchen / cook', 0.5],
  ['other', 'Other', 0.5],
];

export const EXAMPLE_STAFF = [
  ['Server 1', 'server', 6],
  ['Server 2', 'server', 5],
  ['Bartender', 'bartender', 6],
  ['Busser', 'busser', 4],
  ['Runner', 'runner', 3],
];

export const METHODS = [
  ['By hours', 'Everyone earns the same amount per hour worked. Simple, and fair when everyone does similar work.',
    '$600 ÷ 24 hours = $25 an hour. A server who worked 6 hours gets $150, the runner who worked 3 hours gets $75.'],
  ['By hours and role', 'Each role gets points (server 1, busser 0.5…). Share = hours × points. The most common method in full-service restaurants.',
    'Server 6 h × 1 = 6 points, busser 4 h × 0.5 = 2 points. 20.5 points in total, so each point is worth $29.27.'],
  ['Equal split', 'Everyone on the shift gets the same amount, whatever their hours. Works for small teams on the same shift.',
    '$600 shared by 5 people = $120 each.'],
];

export const FAQ = [
  ['How do you split tips fairly among restaurant staff?',
    'Most restaurants use hours worked, or hours multiplied by role points. Hours alone pays everyone the same hourly tip rate. Points let front-line roles such as servers and bartenders earn a bigger share than support roles such as bussers and runners. Whatever you choose, write it down, share it with the team and apply it the same way every shift.'],
  ['Is tip pooling legal?',
    'Yes, in the US and UK, as long as you follow the rules. In the US, employers, managers and supervisors cannot keep any part of the pool, and who can join depends on whether you take a tip credit. In the UK, all tips must go to workers and be shared fairly under a written policy. Some US states have extra rules, so check your state labor department.'],
  ['Can managers or owners be part of the tip pool?',
    'In the US, no. Under the federal Fair Labor Standards Act, employers, managers and supervisors cannot receive tips from a pool, even if they sometimes serve tables. In the UK, the business cannot keep any tips. Managers who are workers can be included if the split is fair, and the government’s Code of Practice on fair and transparent distribution of tips explains how.'],
  ['Should kitchen staff get a share of the tips?',
    'Many restaurants now include the kitchen because the food is part of the service. In the US you can only include cooks and dishwashers if you pay every employee in the pool at least the full minimum wage and take no tip credit. In the UK, kitchen staff can be included as long as the split is fair and in your written tipping policy.'],
  ['How does a points-based tip pool work?',
    'Give each role a number of points per hour, for example server 1, bartender 1, busser 0.5 and host 0.4. Multiply each person’s hours by their points, add everyone’s points together, and divide the total tips by that number to get the value of one point. Each person gets their points × the point value.'],
  ['What is the difference between a tip pool and a tip out?',
    'In a tip pool, all tips go into one pot and are shared using a formula. In a tip out, each server keeps their own tips but passes a set share to support staff, for example 2% of their sales to the bar and 1% to bussers. Some restaurants combine the two.'],
  ['Do card tips and cash tips both go into the pool?',
    'Usually yes. Add the card tips from your card machine or POS for the shift, count the cash tips, and put the total into the calculator. Keep a record of each payout so staff can see how their share was worked out.'],
  ['How often should pooled tips be paid out?',
    'Many restaurants pay tips daily in cash or with each payroll. In the UK, tips must be paid to workers by the end of the month after the month the customer paid. In the US, card tips must be paid by the regular payday at the latest.'],
];

export const RELATED = [
  ['/tools/tip-calculator', 'Tip Calculator', 'Work out a tip, split the bill and round up.'],
  ['/tools/labor-cost-calculator', 'Labor Cost Calculator', 'See your staff cost as a share of sales.'],
  ['/tools/shift-scheduler', 'Shift Scheduler', 'Plan who works when for the week.'],
];
