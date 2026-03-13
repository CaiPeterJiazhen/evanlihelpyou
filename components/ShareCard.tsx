"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from './LanguageContext';
import { countryNames } from './LanguageContext'; // 瀵煎叆countryNames瀵硅薄

// 鎵╁睍鎺ュ彛锛屾敮鎸佹洿澶氬睘鎬?
interface ShareCardProps {
  // 鍩虹鏁版嵁
  value: string;
  assessment: string;
  assessmentColor: string;
  cityFactor: string;
  workHours: string;
  commuteHours: string;
  restTime: string;
  dailySalary: string;
  isYuan: string;
  workDaysPerYear: string;
  countryCode: string;
  countryName: string;
  currencySymbol: string;
  
  // 璇︾粏宸ヤ綔淇℃伅
  workDaysPerWeek: string;
  wfhDaysPerWeek: string;
  annualLeave: string;
  paidSickLeave: string;
  publicHolidays: string;
  
  // 宸ヤ綔鐜
  workEnvironment: string;
  leadership: string;
  teamwork: string;
  homeTown: string;
  shuttle: string;
  canteen: string;
  
  // 瀛﹀巻鍜屽伐浣滅粡楠?
  degreeType: string;
  schoolType: string;
  bachelorType: string;
  education: string;
  workYears: string;
  jobStability: string;
  promotionCycle: string;
  equityValue: string;
  isPublic: boolean;
  
  // 鏂板灞炴€?
  hasShuttle: boolean;
  hasCanteen: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getConfidenceFactor = (isPublic: boolean) => (isPublic ? 0.8 : 0.3);

const getPromotionFactor = (promotionCycle: string) => {
  const cycle = parseFloat(promotionCycle) || 3;
  return clamp(3 / cycle, 0.5, 2.0);
};

// 灏嗕腑鏂囪瘎绾ц浆鎹负缈昏瘧閿?
const getAssessmentKey = (assessment: string): string => {
  // 濡傛灉宸茬粡鏄炕璇戦敭锛岀洿鎺ヨ繑鍥?
  if (assessment.startsWith('rating_')) {
    return assessment;
  }
  
  // 鍚﹀垯锛屽皢涓枃璇勭骇杞崲涓虹炕璇戦敭
  switch (assessment) {
    case '鎯ㄧ粷浜哄': return 'rating_terrible';
    case '鐣ユ儴': return 'rating_poor';
    case '涓€鑸?: return 'rating_average';
    case '杩樹笉閿?: return 'rating_good';
    case '寰堢埥': return 'rating_great';
    case '鐖藉埌鐖嗙偢': return 'rating_excellent';
    case '浜虹敓宸呭嘲': return 'rating_perfect';
    case '璇疯緭鍏ュ勾钖?: return 'rating_enter_salary';
    default: return assessment;
  }
};

// 鑾峰彇CSS棰滆壊浠ｇ爜
const getColorFromClassName = (className: string): string => {
  switch(className) {
    case 'text-pink-800': return '#9d174d';
    case 'text-red-500': return '#ef4444';
    case 'text-orange-500': return '#f97316';
    case 'text-blue-500': return '#3b82f6';
    case 'text-green-500': return '#22c55e';
    case 'text-purple-500': return '#a855f7';
    case 'text-yellow-400': return '#facc15';
    default: return '#1f2937'; // text-gray-900
  }
};

// 鑾峰彇鍩庡競鍚嶇О
const getCityName = (cityFactor: string, t: (key: string) => string): string => {
  if (cityFactor === '0.70') return t('city_tier1');
  else if (cityFactor === '0.80') return t('city_newtier1');
  else if (cityFactor === '1.0') return t('city_tier2');
  else if (cityFactor === '1.10') return t('city_tier3');
  else if (cityFactor === '1.25') return t('city_tier4');
  else if (cityFactor === '1.40') return t('city_county');
  else if (cityFactor === '1.50') return t('city_town');
  return t('city_tier3'); // 榛樿鍊?
};

// 鑾峰彇宸ヤ綔鐜鎻忚堪
const getWorkEnvironmentDesc = (env: string, t: (key: string) => string): string => {
  if (env === '0.8') return t('env_remote');
  else if (env === '0.9') return t('env_factory');
  else if (env === '1.0') return t('env_normal');
  else if (env === '1.1') return t('env_cbd');
  return t('env_normal');
};

// 鑾峰彇棰嗗璇勪环
const getLeadershipDesc = (rating: string, t: (key: string) => string): string => {
  if (rating === '0.7') return t('leader_bad');
  else if (rating === '0.9') return t('leader_strict');
  else if (rating === '1.0') return t('leader_normal');
  else if (rating === '1.1') return t('leader_good');
  else if (rating === '1.3') return t('leader_favorite');
  return t('leader_normal');
};

// 鑾峰彇鍚屼簨鐜璇勪环
const getTeamworkDesc = (rating: string, t: (key: string) => string): string => {
  if (rating === '0.9') return t('team_bad');
  else if (rating === '1.0') return t('team_normal');
  else if (rating === '1.1') return t('team_good');
  else if (rating === '1.2') return t('team_excellent');
  return t('team_normal');
};

// 鑾峰彇鐝溅鏈嶅姟鎻忚堪
const getShuttleDesc = (shuttle: string, t: (key: string) => string): string => {
  if (shuttle === '1.0') return t('shuttle_none');
  else if (shuttle === '0.9') return t('shuttle_inconvenient');
  else if (shuttle === '0.7') return t('shuttle_convenient');
  else if (shuttle === '0.5') return t('shuttle_direct');
  return t('shuttle_none');
};

// 鑾峰彇椋熷爞鎯呭喌鎻忚堪
const getCanteenDesc = (canteen: string, t: (key: string) => string): string => {
  if (canteen === '1.0') return t('canteen_none');
  else if (canteen === '1.05') return t('canteen_average');
  else if (canteen === '1.1') return t('canteen_good');
  else if (canteen === '1.15') return t('canteen_excellent');
  return t('canteen_none');
};

// 鑾峰彇鍚堝悓绫诲瀷鎻忚堪
const getJobStabilityDesc = (type: string, t: (key: string) => string): string => {
  if (type === 'private') return t('job_private');
  else if (type === 'foreign') return t('job_foreign');
  else if (type === 'state') return t('job_state');
  else if (type === 'government') return t('job_government');
  else if (type === 'dispatch') return t('job_dispatch');
  else if (type === 'freelance') return t('job_freelance');
  return t('job_private');
};

// 鑾峰彇瀛﹀巻鎻忚堪
const getDegreeDesc = (type: string, t: (key: string) => string): string => {
  if (type === 'belowBachelor') return t('below_bachelor');
  else if (type === 'bachelor') return t('bachelor');
  else if (type === 'masters') return t('masters');
  else if (type === 'phd') return t('phd');
  return t('bachelor');
};

// 鑾峰彇瀛︽牎绫诲瀷鎻忚堪
const getSchoolTypeDesc = (type: string, degree: string, t: (key: string) => string): string => {
  if (type === 'secondTier') return t('school_second_tier');
  else if (type === 'firstTier') {
    if (degree === 'bachelor') return t('school_first_tier_bachelor');
    return t('school_first_tier_higher');
  } 
  else if (type === 'elite') {
    if (degree === 'bachelor') return t('school_elite_bachelor');
    return t('school_elite_higher');
  }
  return t('school_first_tier_bachelor');
};

// 鑾峰彇emoji琛ㄦ儏
const getEmoji = (value: number): string => {
  if (value < 0.6) return '馃槶';
  if (value < 1.0) return '馃様';
  if (value <= 1.8) return '馃槓';
  if (value <= 2.5) return '馃槉';
  if (value <= 3.2) return '馃榿';
  if (value <= 4.0) return '馃ぉ';
  return '馃帀';
};

// 鑾峰彇宸ヤ綔骞撮檺鎻忚堪
const getWorkYearsDesc = (years: string, t: (key: string) => string): string => {
  if (years === '0') return t('fresh_graduate');
  else if (years === '1') return t('years_1_3');
  else if (years === '2') return t('years_3_5');
  else if (years === '4') return t('years_5_8');
  else if (years === '6') return t('years_8_10');
  else if (years === '10') return t('years_10_12');
  else if (years === '15') return t('years_above_12');
  return t('fresh_graduate');
};

// 鑾峰彇褰撳墠璇█鐜涓嬬殑鍥藉鍚嶇О
const getCountryName = (countryCode: string, currentLanguage: string): string => {
  if (currentLanguage === 'en') {
    return countryNames.en[countryCode] || countryCode || 'Unknown';
  }
  if (currentLanguage === 'ja') {
    return countryNames.ja[countryCode] || countryCode || '涓嶆槑';
  }
  return countryNames.zh[countryCode] || countryCode || '鏈煡';
};

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString(undefined, {
    maximumFractionDigits: value >= 100 ? 0 : 2,
    minimumFractionDigits: value > 0 && value < 100 ? 2 : 0,
  });
};

const ShareCard: React.FC<ShareCardProps> = (props) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const simpleReportRef = useRef<HTMLDivElement>(null); // 娣诲姞绠€鍖栫増鎶ュ憡鐨勫紩鐢?
  const [isDownloading, setIsDownloading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const { t, language } = useLanguage();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // 瀹㈡埛绔覆鏌撴爣蹇?
  const [isClient, setIsClient] = useState(false);
  
  // 纭繚鍙湪瀹㈡埛绔墽琛?
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 椤甸潰杞藉叆鍔ㄧ敾鏁堟灉
  useEffect(() => {
    // 纭繚鍙湪瀹㈡埛绔墽琛?
    if (typeof window !== 'undefined') {
      setFadeIn(true);
    }
  }, []);

  // 鐢熸垚涓€у寲璇勪环
  const personalizedComments = (() => {
    const comments = [];
    const valueNum = parseFloat(props.value);
    
    // 1. 鏍规嵁鎬讳綋鎬т环姣旂敓鎴愪富璇勪环
    let mainComment = "";
    if (valueNum < 0.6) {
      mainComment = t('share_low_value_assessment_1');
    } else if (valueNum < 1.0) {
      mainComment = t('share_low_value_assessment_2');
    } else if (valueNum <= 1.8) {
      mainComment = t('share_medium_value_assessment_1');
    } else if (valueNum <= 2.5) {
      mainComment = t('share_medium_value_assessment_2');
    } else if (valueNum <= 3.2) {
      mainComment = t('share_high_value_assessment_1');
    } else if (valueNum <= 4.0) {
      mainComment = t('share_high_value_assessment_2');
    } else {
      mainComment = t('share_high_value_assessment_3');
    }
    comments.push({ 
      title: t('share_final_assessment'), 
      content: mainComment, 
      emoji: getEmoji(valueNum),
      details: [
        { label: t('share_final_assessment'), value: `${props.value} (${t(getAssessmentKey(props.assessment))})` }
      ]
    });
    
    // 2. 宸ヤ綔鍩庡競璇勪环
    const cityName = getCityName(props.cityFactor, t);
    const isHomeTown = props.homeTown === 'yes';
    let cityComment = "";
    
    // 鍏堟牴鎹煄甯傜瓑绾ф坊鍔犺瘎浠?
    if (props.cityFactor === '0.70' || props.cityFactor === '0.80') {
      cityComment = t('share_tier1andnewtier1_city_comment');
    } else if (props.cityFactor === '1.0' || props.cityFactor === '1.10') {
      cityComment = t('share_tier2and3_city_comment');
    } else {
      cityComment = t('share_tier4andbelow_city_comment');
    }
    
    // 鐒跺悗娣诲姞瀹朵埂鐩稿叧璇勪环
    if (isHomeTown) {
      cityComment += " " + t('share_hometown_comment');
    } else {
      cityComment += " " + t('share_not_hometown_comment');
    }
    
    comments.push({ 
      title: t('share_work_city'), 
      content: cityComment, 
      emoji: isHomeTown ? "馃彙" : "馃寙",
      details: [
        { label: t('share_work_city'), value: cityName },
        { label: t('share_is_hometown'), value: isHomeTown ? t('share_yes') : t('share_no') },
        { label: t('share_country'), value: getCountryName(props.countryCode, language) }
      ]
    });
    
    // 3. 閫氬嫟涓嶹FH璇勪环
    const commuteHoursNum = parseFloat(props.commuteHours);
    const wfhDaysNum = parseFloat(props.wfhDaysPerWeek);
    const workDaysNum = parseFloat(props.workDaysPerWeek);
    const wfhRatio = workDaysNum > 0 ? (wfhDaysNum / workDaysNum) : 0;
    
    let commuteComment = "";
    
    if (commuteHoursNum <= 1) {
      commuteComment = t('share_commute_short');
    } else if (commuteHoursNum <= 2) {
      commuteComment = t('share_commute_medium');
    } else {
      commuteComment = t('share_commute_long');
    }
    
    if (wfhRatio >= 0.6) {
      commuteComment += " " + t('share_wfh_high');
    } else if (wfhRatio >= 0.2) {
      commuteComment += " " + t('share_wfh_medium');
    }
    
    // 鍙湁褰撶敤鎴峰嬀閫変簡鐝溅閫夐」锛屼笖鐝溅瀵归€氬嫟鏈夋闈㈠奖鍝嶆椂鎵嶆坊鍔犺瘎浠?
    if (props.hasShuttle && (props.shuttle === '0.7' || props.shuttle === '0.5')) {
      commuteComment += " " + t('share_shuttle_service_good');
    }
    
    const commuteDetails = [
      { label: t('share_daily_commute_hours'), value: `${props.commuteHours} ${t('share_hours')}` },
      { label: t('share_remote_work'), value: `${props.wfhDaysPerWeek}/${props.workDaysPerWeek} ${t('share_days_per_week')} (${Math.round(wfhRatio * 100)}%)` }
    ];
    
    // 鍙湁褰撶敤鎴峰嬀閫変簡鐝溅閫夐」鏃舵墠娣诲姞鐝溅淇℃伅
    if (props.hasShuttle) {
      commuteDetails.push({ label: t('share_shuttle_service'), value: getShuttleDesc(props.shuttle, t) });
    }
    
    comments.push({ 
      title: t('share_daily_commute_hours'), 
      content: commuteComment, 
      emoji: wfhRatio >= 0.5 ? "馃彔" : "馃殞",
      details: commuteDetails
    });
    
    // 4. 宸ヤ綔鐜涓庝汉闄呭叧绯昏瘎浠?
    const leadershipRating = props.leadership;
    const teamworkRating = props.teamwork;
    const workEnvironment = props.workEnvironment;
    
    let environmentComment = "";
    
    if (workEnvironment === '1.1') {
      environmentComment = t('share_cbd_environment');
    } else if (workEnvironment === '0.8' || workEnvironment === '0.9') {
      environmentComment = t('share_factory_environment');
    } else {
      environmentComment = t('share_normal_environment');
    }
    
    // 鏇寸粏鑷寸殑棰嗗鍏崇郴璇勪环
    if (leadershipRating === '1.3') {
      environmentComment += " " + t('share_leadership_excellent');
    } else if (leadershipRating === '1.1') {
      environmentComment += " " + t('share_leadership_good');
    } else if (leadershipRating === '1.0') {
      environmentComment += " " + t('share_leadership_normal');
    } else if (leadershipRating === '0.9') {
      environmentComment += " " + t('share_leadership_strict');
    } else if (leadershipRating === '0.7') {
      environmentComment += " " + t('share_leadership_bad');
    }
    
    // 鏇寸粏鑷寸殑鍚屼簨鍏崇郴璇勪环
    if (teamworkRating === '1.2') {
      environmentComment += " " + t('share_teamwork_excellent');
    } else if (teamworkRating === '1.1') {
      environmentComment += " " + t('share_teamwork_good');
    } else if (teamworkRating === '1.0') {
      environmentComment += " " + t('share_teamwork_normal');
    } else if (teamworkRating === '0.9') {
      environmentComment += " " + t('share_teamwork_bad');
    }
    
    const environmentDetails = [
      { label: t('share_office_environment'), value: getWorkEnvironmentDesc(workEnvironment, t) },
      { label: t('share_leadership_relation'), value: getLeadershipDesc(leadershipRating, t) },
      { label: t('share_colleague_relationship'), value: getTeamworkDesc(teamworkRating, t) }
    ];
    
    // 鍙湁褰撶敤鎴峰嬀閫変簡椋熷爞閫夐」鏃舵墠娣诲姞椋熷爞淇℃伅
    if (props.hasCanteen) {
      environmentDetails.push({ label: t('share_canteen_quality'), value: getCanteenDesc(props.canteen, t) });
    }
    
    comments.push({ 
      title: t('share_work_environment_title'), 
      content: environmentComment, 
      emoji: "馃彚",
      details: environmentDetails
    });
    
    // 5. 宸ヤ綔鏃堕棿涓庡己搴﹁瘎浠?
    const workHoursNum = parseFloat(props.workHours);
    const restTimeNum = parseFloat(props.restTime);
    const effectiveWorkTime = workHoursNum + parseFloat(props.commuteHours) - 0.5 * restTimeNum;
    
    let workTimeComment = "";
    if (effectiveWorkTime <= 8) {
      workTimeComment = t('share_workhours_balanced');
    } else if (effectiveWorkTime <= 11) {
      workTimeComment = t('share_workhours_long');
    } else {
      workTimeComment = t('share_workhours_excessive');
    }
    
    if (restTimeNum >= 2.5) {
      workTimeComment += " " + t('share_rest_adequate');
    } else if (restTimeNum <= 1) {
      workTimeComment += " " + t('share_rest_insufficient');
    }
    
    const annualLeaveNum = parseFloat(props.annualLeave);
    if (annualLeaveNum >= 15) {
      workTimeComment += " " + t('share_leave_abundant');
    } else if (annualLeaveNum <= 5) {
      workTimeComment += " " + t('share_leave_limited');
    }
    
    const totalLeave = parseFloat(props.annualLeave) + parseFloat(props.publicHolidays) + parseFloat(props.paidSickLeave) * 0.6;
    
    comments.push({ 
      title: t('share_work_hours_title'), 
      content: workTimeComment, 
      emoji: "鈴憋笍",
      details: [
        { label: t('work_hours'), value: `${props.workHours} ${t('share_hours')}` },
        { label: t('share_daily_work_hours'), value: `${effectiveWorkTime.toFixed(1)} ${t('share_hours')}` },
        { label: t('rest_time'), value: `${props.restTime} ${t('share_hours')}` },
        { label: t('annual_leave'), value: `${props.annualLeave} ${t('share_days_per_year')}` },
        { label: t('paid_sick_leave'), value: `${props.paidSickLeave} ${t('share_days_per_year')}` },
        { label: t('public_holidays'), value: `${props.publicHolidays} ${t('share_days_per_year')}` }
      ]
    });
    
    // 6. 鏁欒偛鑳屾櫙涓庤亴涓氬彂灞曡瘎浠?
    const degreeType = props.degreeType;
    const workYears = props.workYears;
    const jobStability = props.jobStability;
    
    let careerComment = "";
    if (degreeType === 'phd') {
      careerComment = t('share_phd_comment');
    } else if (degreeType === 'masters') {
      careerComment = t('share_masters_comment');
    } else if (degreeType === 'bachelor') {
      careerComment = t('share_bachelor_comment');
    } else {
      careerComment = t('share_below_bachelor_comment');
    }
    
    if (workYears === '0') {
      careerComment += " " + t('share_fresh_graduate_comment');
    } else if (parseInt(workYears) >= 6) {
      careerComment += " " + t('share_experienced_comment');
    } else {
      careerComment += " " + t('share_mid_career_comment');
    }
    
    if (jobStability === 'government') {
      careerComment += " " + t('share_government_job_comment');
    } else if (jobStability === 'private' || jobStability === 'foreign' || jobStability === 'state') {
      careerComment += " " + t('share_private_job_comment');
    } else if (jobStability === 'dispatch') {
      careerComment += " " + t('share_dispatch_job_comment');
    } else if (jobStability === 'freelance') {
      careerComment += " " + t('share_freelance_job_comment');
    }
    
    comments.push({ 
      title: t('share_education_and_experience'), 
      content: careerComment, 
      emoji: "馃摎",
      details: [
        { label: t('share_highest_degree'), value: getDegreeDesc(degreeType, t) },
        { label: t('share_school_type_label'), value: getSchoolTypeDesc(props.schoolType, degreeType, t) },
        { label: t('share_work_years_label'), value: getWorkYearsDesc(workYears, t) },
        { label: t('share_contract_type_label'), value: getJobStabilityDesc(jobStability, t) }
      ]
    });

    // 7. 鏈潵浠峰€艰瘎浠?
    const promotionFactor = getPromotionFactor(props.promotionCycle);
    const hasEquity = parseFloat(props.equityValue || '0') > 0;
    const confidenceFactor = getConfidenceFactor(props.isPublic);
    const equityContribution = hasEquity ? parseFloat(props.equityValue || '0') * confidenceFactor : 0;
    const adjustedAnnualComp = parseFloat(props.dailySalary || '0') * parseFloat(props.workDaysPerYear || '0');
    const equityRatio = adjustedAnnualComp > 0 ? equityContribution / adjustedAnnualComp : 0;

    let futureComment = '';
    if (promotionFactor > 1) {
      futureComment = t('share_future_value_fast');
    } else if (promotionFactor < 0.9) {
      futureComment = t('share_future_value_slow');
    } else {
      futureComment = t('share_future_value_balanced');
    }

    if (hasEquity && equityRatio >= 0.2) {
      futureComment += ' ' + t('share_future_value_equity_rich');
    } else if (hasEquity && equityContribution > 0) {
      futureComment += ' ' + t('share_future_value_equity_present');
    }

    if (hasEquity) {
      futureComment += ' ' + t('share_equity_bonus_applied');
    }

    const futureDetails = [
      { label: t('share_promotion_cycle_label'), value: `${props.promotionCycle}${t('share_year_unit')}` },
      { label: t('share_promotion_factor_label'), value: `${promotionFactor.toFixed(2)}x` },
    ];

    if (hasEquity) {
      futureDetails.push(
        { label: t('share_equity_value_label'), value: `${props.currencySymbol}${formatNumber(parseFloat(props.equityValue || '0'))}` },
        { label: t('share_equity_realization_label'), value: props.isPublic ? t('share_yes') : t('share_no') }
      );
    }

    comments.push({
      title: t('share_future_value'),
      content: futureComment,
      emoji: promotionFactor > 1 || equityRatio >= 0.2 ? '馃殌' : '馃搱',
      details: futureDetails
    });
    
    // 8. 钖祫璇勪环
    const dailySalary = props.dailySalary;
    const isYuan = props.isYuan === 'true';
    
    let salaryComment = "";
    const salaryNumeric = parseFloat(dailySalary);
    if (isYuan) {
      if (salaryNumeric >= 1000) {
        salaryComment = t('share_salary_high_cny');
      } else if (salaryNumeric >= 500) {
        salaryComment = t('share_salary_medium_cny');
      } else {
        salaryComment = t('share_salary_low_cny');
      }
    } else {
      if (salaryNumeric >= 150) {
        salaryComment = t('share_salary_high_foreign');
      } else if (salaryNumeric >= 80) {
        salaryComment = t('share_salary_medium_foreign');
      } else {
        salaryComment = t('share_salary_low_foreign');
      }
    }
    
    // 鑰冭檻鍩庡競鍥犵礌
    if (props.cityFactor === '0.70' || props.cityFactor === '0.80') {
      salaryComment += " " + t('share_high_cost_city');
    } else if (props.cityFactor === '1.25' || props.cityFactor === '1.40' || props.cityFactor === '1.50') {
      salaryComment += " " + t('share_low_cost_city');
    }
    
    comments.push({ 
      title: t('share_daily_salary'), 
      content: salaryComment, 
      emoji: "馃挵",
      details: [
        { label: t('share_daily_salary'), value: `${props.currencySymbol}${dailySalary}/${t('share_day')}` },
        { label: t('share_working_days_per_year'), value: `${props.workDaysPerYear} ${t('share_days')}` }
      ]
    });
    
    // 9. 鎬荤粨鎬т环姣旇瘎浠?
    let valueComment = "";
    if (valueNum < 1.0) {
      valueComment = t('share_value_low');
    } else if (valueNum <= 2.0) {
      valueComment = t('share_value_medium');
    } else {
      valueComment = t('share_value_high');
    }
    
    comments.push({ 
      title: t('share_summary_advice'), 
      content: valueComment, 
      emoji: "馃拵",
      details: []
    });
    
    return comments;
  })();
  
  // 鏄惁鏄Щ鍔ㄨ澶囷紙鍝嶅簲寮忚璁¤緟鍔╁嚱鏁帮級
  const [isMobile, setIsMobile] = useState(false);
  
  // 妫€娴嬭澶囩被鍨?
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 640);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // 澶勭悊涓嬭浇鍥剧墖 - 浣跨敤绠€鍖栫増鎶ュ憡
  const handleDownload = async () => {
    if (!simpleReportRef.current || isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      // 鑾峰彇绠€鍖栫増鎶ュ憡鍏冪礌
      const element = simpleReportRef.current;
      
      // 鍔ㄦ€佸鍏tml2canvas锛岀‘淇濆彧鍦ㄥ鎴风鍔犺浇
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;

      // 淇 html2canvas 鍦ㄥ鐞?rem 鏃舵枃瀛楀熀绾块棶棰?
      const style = document.createElement('style');
      document.head.appendChild(style);
      style.sheet?.insertRule('body > div:last-child img { display: inline-block; }');
      
      // 浣跨敤html2canvas鐢熸垚鍥剧墖
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      // 鐢熸垚 canvas 鍚庣Щ闄や复鏃剁殑 style 鏍囩
      style.remove();
      
      // 杞崲涓哄浘鐗囧苟涓嬭浇
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${t('share_job_worth_report')}.png`;
      link.click();
      
    } catch (error) {
      console.error('鐢熸垚鍒嗕韩鍥剧墖澶辫触:', error);
      alert('鐢熸垚鍒嗕韩鍥剧墖澶辫触锛岃绋嶅悗鍐嶈瘯');
    } finally {
      setIsDownloading(false);
    }
  };

  // 鑾峰彇鑳屾櫙鏍峰紡
  const getBackground = () => {
    const valueNum = parseFloat(props.value);
    if (valueNum < 0.6) return 'from-pink-100 to-red-100 dark:from-pink-900 dark:to-red-900';
    if (valueNum < 1.0) return 'from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900';
    if (valueNum <= 1.8) return 'from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900';
    if (valueNum <= 2.5) return 'from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900';
    if (valueNum <= 3.2) return 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900';
    if (valueNum <= 4.0) return 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900';
    return 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackground()} flex flex-col items-center justify-start p-4 md:p-8 transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'} dark:text-white`}>
      {/* 杩斿洖鎸夐挳 */}
      <div className="w-full max-w-4xl mb-4 md:mb-6">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('share_back_to_calculator')}</span>
        </Link>
      </div>
      
      <div ref={reportRef} className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-4 md:p-10">
        {/* 鏍囬 - 绉诲姩绔洿绱у噾 */}
        <div className="mb-5 md:mb-10 text-center">
          <div className="text-4xl md:text-6xl mb-2 md:mb-4">{isClient ? getEmoji(parseFloat(props.value)) : '馃槉'}</div>
          <h1 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {t('share_your_job_worth_report')}
          </h1>
          <div className="flex justify-center items-center gap-2">
            <span className="text-lg md:text-2xl font-bold px-2 py-0.5 rounded-lg" style={{ color: getColorFromClassName(props.assessmentColor), backgroundColor: `${getColorFromClassName(props.assessmentColor)}20` }}>
              {props.value}
            </span>
            <span className="text-base md:text-lg text-gray-700">{isClient ? t(getAssessmentKey(props.assessment)) : ''}</span>
          </div>
        </div>
        
        {/* 鎬т环姣旇瘎璇崱鐗?- 绉诲姩绔洿绱у噾 */}
        <div className="space-y-4 md:space-y-6">
          {isClient && personalizedComments.map((comment, index) => (
            <React.Fragment key={index}>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start gap-2.5 md:gap-4">
                  <div className="text-2xl md:text-4xl flex-shrink-0 mt-0.5">{comment.emoji}</div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 text-gray-800">{comment.title}</h3>
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed mb-2 md:mb-3">{comment.content}</p>
                    
                    {/* 鐢ㄦ埛閫夐」璇︽儏 - 绉诲姩绔娇鐢ㄨ鍐呮帓鍒?*/}
                    {comment.details && comment.details.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className={isMobile ? "flex flex-wrap gap-x-4 gap-y-1.5" : "grid grid-cols-2 gap-2"}>
                          {comment.details.map((detail, i) => (
                            isMobile ? (
                              <div key={i} className="flex items-center text-xs">
                                <span className="text-gray-500 mr-1">{detail.label}:</span>
                                <span className="font-medium text-gray-800">{detail.value}</span>
                              </div>
                            ) : (
                              <div key={i} className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">{detail.label}</span>
                                <span className="text-xs md:text-sm font-medium text-gray-800">{detail.value}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </React.Fragment>
          ))}
        </div>
        
        {/* 搴曢儴淇℃伅 - 鏇村皬鐨勬枃瀛?*/}
        <div className="mt-6 md:mt-10 text-center text-gray-500 space-y-0.5 text-xs md:text-sm">
          <div>{t('share_custom_made')}</div>
          <div>worthjob.zippland.com</div>
        </div>
      </div>
      
      {/* 鎿嶄綔鎸夐挳 - 鏇村皬鐨勬寜閽?*/}
      <div className="flex justify-center gap-4 mt-4 md:mt-8">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base rounded-lg shadow-md transition-colors"
        >
          <Download className="w-4 h-4 md:w-5 md:h-5" />
          {isDownloading ? t('share_generating') : t('share_download_report')}
        </button>
      </div>
      
      {/* 绠€鍖栫増鎶ュ憡锛屼粎鐢ㄤ簬涓嬭浇锛屽湪椤甸潰涓殣钘?*/}
      {isClient && (
        <div className="fixed top-0 left-0 opacity-0 pointer-events-none">
          <div ref={simpleReportRef} className="w-[800px] bg-white p-8 text-gray-900" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* 鎶ュ憡澶撮儴 - 娓愬彉鑳屾櫙 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 border-b border-gray-200">
                <div className="text-center">
                  <div className="text-5xl mb-4">{getEmoji(parseFloat(props.value))}</div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('share_job_worth_report')}</h1>
                  <div className="inline-block px-4 py-2 rounded-full bg-white shadow-sm">
                    <span className="font-semibold text-xl" style={{ color: getColorFromClassName(props.assessmentColor) }}>
                      {props.value} - {t(getAssessmentKey(props.assessment))}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 鎶ュ憡鍐呭 */}
              <div className="p-6">
                {/* 鏁版嵁琛ㄦ牸 */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {/* 鍩虹淇℃伅 */}
                  <div className="col-span-2 mb-4">
                    <h2 className="font-bold text-gray-800 text-lg pb-2 mb-3 border-b border-gray-200 flex items-center">
                      <span className="mr-2">馃搳</span> {t('share_basic_info')}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_work_city')}</div>
                        <div className="font-medium text-gray-800 mt-1">{getCityName(props.cityFactor, t)}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_country')}</div>
                        <div className="font-medium text-gray-800 mt-1">{getCountryName(props.countryCode, language)}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_is_hometown')}</div>
                        <div className="font-medium text-gray-800 mt-1">{props.homeTown === 'yes' ? t('share_yes') : t('share_no')}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_daily_salary')}</div>
                        <div className="font-medium text-gray-800 mt-1">{props.currencySymbol}{props.dailySalary}/{t('share_day')}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_working_days_per_year')}</div>
                        <div className="font-medium text-gray-800 mt-1">{props.workDaysPerYear} {t('share_days')}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_future_value')}</div>
                        <div className="font-medium text-gray-800 mt-1">{getPromotionFactor(props.promotionCycle).toFixed(2)}x</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 宸ヤ綔鏃堕棿 */}
                  <div className="col-span-1">
                    <h2 className="font-bold text-gray-800 text-lg pb-2 mb-3 border-b border-gray-200 flex items-center">
                      <span className="mr-2">鈴憋笍</span> {t('share_work_hours_title')}
                    </h2>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-500">{t('share_daily_work_hours')}</span>
                        <span className="font-medium text-gray-800">{props.workHours} {t('share_hours')}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-500">{t('share_daily_commute_hours')}</span>
                        <span className="font-medium text-gray-800">{props.commuteHours} {t('share_hours')}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-500">{t('share_rest_time')}</span>
                        <span className="font-medium text-gray-800">{props.restTime} {t('share_hours')}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-500">{t('share_weekly_work_days')}</span>
                        <span className="font-medium text-gray-800">{props.workDaysPerWeek} {t('share_days')}</span>
                      </div>
                      {props.hasShuttle && (
                        <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                          <span className="text-sm text-gray-500">{t('share_shuttle_service')}</span>
                          <span className="font-medium text-gray-800">{getShuttleDesc(props.shuttle, t)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 宸ヤ綔鐜 */}
                  <div className="col-span-1">
                    <h2 className="font-bold text-gray-800 text-lg pb-2 mb-3 border-b border-gray-200 flex items-center">
                      <span className="mr-2">馃彚</span> {t('share_work_environment_title')}
                    </h2>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-500">{t('share_office_environment')}</span>
                        <span className="font-medium text-gray-800">{getWorkEnvironmentDesc(props.workEnvironment, t)}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-500">{t('share_leadership_relation')}</span>
                        <span className="font-medium text-gray-800">{getLeadershipDesc(props.leadership, t)}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-500">{t('share_colleague_relationship')}</span>
                        <span className="font-medium text-gray-800">{getTeamworkDesc(props.teamwork, t)}</span>
                      </div>
                      {props.hasCanteen && (
                        <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                          <span className="text-sm text-gray-500">{t('share_canteen_quality')}</span>
                          <span className="font-medium text-gray-800">{getCanteenDesc(props.canteen, t)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 鏁欒偛鑳屾櫙 */}
                  <div className="col-span-2 mt-2">
                    <h2 className="font-bold text-gray-800 text-lg pb-2 mb-3 border-b border-gray-200 flex items-center">
                      <span className="mr-2">馃摎</span> {t('share_education_and_experience')}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_highest_degree')}</div>
                        <div className="font-medium text-gray-800 mt-1">{getDegreeDesc(props.degreeType, t)}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_school_type_label')}</div>
                        <div className="font-medium text-gray-800 mt-1">{getSchoolTypeDesc(props.schoolType, props.degreeType, t)}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_work_years_label')}</div>
                        <div className="font-medium text-gray-800 mt-1">{getWorkYearsDesc(props.workYears, t)}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_contract_type_label')}</div>
                        <div className="font-medium text-gray-800 mt-1">{getJobStabilityDesc(props.jobStability, t)}</div>
                      </div>
                    </div>
                  </div>

                  {/* 鏈潵浠峰€?*/}
                  <div className="col-span-2 mt-2">
                    <h2 className="font-bold text-gray-800 text-lg pb-2 mb-3 border-b border-gray-200 flex items-center">
                      <span className="mr-2">馃殌</span> {t('share_future_value')}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_promotion_cycle_label')}</div>
                        <div className="font-medium text-gray-800 mt-1">{props.promotionCycle}{t('share_year_unit')}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">{t('share_promotion_factor_label')}</div>
                        <div className="font-medium text-gray-800 mt-1">{getPromotionFactor(props.promotionCycle).toFixed(2)}x</div>
                      </div>
                      {parseFloat(props.equityValue || '0') > 0 && (
                        <>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">{t('share_equity_value_label')}</div>
                            <div className="font-medium text-gray-800 mt-1">{props.currencySymbol}{formatNumber(parseFloat(props.equityValue || '0'))}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500">{t('share_equity_realization_label')}</div>
                            <div className="font-medium text-gray-800 mt-1">{props.isPublic ? t('share_yes') : t('share_no')}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* 缁撹 */}
                  <div className="col-span-2 mt-4">
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-6 border border-gray-200">
                      <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center">
                        <span className="mr-2">馃拵</span> {t('share_final_assessment')}
                      </h2>
                      <div className="flex items-center mb-3">
                        <div className="text-4xl mr-3">{getEmoji(parseFloat(props.value))}</div>
                        <div className="text-xl font-bold" style={{ color: getColorFromClassName(props.assessmentColor) }}>
                          {props.value} - {t(getAssessmentKey(props.assessment))}
                        </div>
                      </div>
                      <p className="text-gray-700">
                        {parseFloat(props.value) < 1.0 
                          ? t('share_value_low') 
                          : parseFloat(props.value) <= 2.0 
                            ? t('share_value_medium') 
                            : t('share_value_high')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 椤佃剼 */}
              <div className="bg-gray-50 py-4 px-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <img 
                      src={`${basePath}/title.png`} 
                      alt="Job Worth Calculator" 
                      className="h-20 mr-3"
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-700">{t('share_custom_made')}</div>
                      <div className="text-sm text-gray-500">worthjob.zippland.com</div>
                    </div>
                  </div>
                  <img 
                    src={`${basePath}/website.png`} 
                    alt=""
                    className="h-16 w-16 opacity-85" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareCard; 
