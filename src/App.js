import './App.css';
import React, { useState } from 'react';
import { nanoid } from 'nanoid'; // 或任意產生唯一字串的方法
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

const daysOfWeek = ['已生成時間', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

function DraggableTime({ id , label, onDelete}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    display: 'inline-block',
    margin: '0.5rem',
    backgroundColor: 'rgb(146, 166, 183)',
    color: 'white',
    borderRadius: '0.375rem',
    cursor: 'grab',
    whiteSpace: 'nowrap',
    padding: '0.3rem 0.6rem',
    fontSize: '1rem',
    position: 'relative', //closeStyle
  };

  const closeStyle = {
    position: 'absolute',
    top: '-7px',
    right: '-7px',
    backgroundColor: 'rgb(207, 158, 158)',
    borderRadius: '50%',
    width: '14px',
    height: '14px',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center',
    cursor: 'pointer',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={closeStyle} onClick={(e) => {
        e.stopPropagation(); // 防止拖曳時誤點
        onDelete(id);
      }}>×</div>
      {/*僅這個文字部分可拖曳*/}
      <span {...listeners} style={{ cursor: 'grab' }}>
        {label}
      </span>
    </div>
  );
}

function DroppableColumn({ id, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    minHeight: '120px',
    padding: '1rem',
    backgroundColor: isOver ? '#e0f2fe' : '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '0.5rem',
    width: '12rem',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{id}</div>
      {children}
    </div>
  );
}

export default function App() {
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');
  const [itemsByDay, setItemsByDay] = useState({
    已生成時間: [],
    星期一: [],
    星期二: [],
    星期三: [],
    星期四: [],
    星期五: [],
    星期六: [],
    星期日: [],
  });

  const handleAddTime = () => {
    //以十進位數字轉換成整數 (確保JS無誤)
    const sh = parseInt(startHour, 10);
    const sm = parseInt(startMinute, 10);
    const eh = parseInt(endHour, 10);
    const em = parseInt(endMinute, 10);

    // 驗證時間格式
    const isValid = (n, min, max) => !isNaN(n) && n >= min && n <= max;
    if (
      !isValid(sh, 0, 23) ||
      !isValid(sm, 0, 59) ||
      !isValid(eh, 0, 23) ||
      !isValid(em, 0, 59)
    ) {
      alert('請輸入有效的時間（小時: 0~23，分鐘: 0~59）');
      return;
    }

    const format = (n) => (n < 10 ? `0${n}` : `${n}`); //正規化呈現
    const formattedTime = `${format(sh)}:${format(sm)}-${format(eh)}:${format(em)}`;

    setItemsByDay((prev) => ({
      ...prev,
      ['已生成時間']: [...prev['已生成時間'], { id: nanoid(), label: formattedTime }],

    }));

    // 清空輸入
    setStartHour('');
    setStartMinute('');
    setEndHour('');
    setEndMinute('');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const sourceDay = Object.keys(itemsByDay).find((day) =>
      itemsByDay[day].some(item => item.id === active.id)
    );

    const targetDay = over.id;
    if (!sourceDay) return;

    setItemsByDay((prev) => {
      const newItems = { ...prev };

      const sourceItem = prev[sourceDay].find(item => item.id === active.id);
      if (!sourceItem) return prev;

      if (sourceDay === '已生成時間') {
        // 複製一份並產生其 id
        const newItem = {
          id: nanoid(),
          label: sourceItem.label,
        };

        // 避免重複加入
        if (!newItems[targetDay].some(item => item.label === newItem.label)) {
          newItems[targetDay] = [...newItems[targetDay], newItem];
        }

      } else {
        // 正常移動
        newItems[sourceDay] = newItems[sourceDay].filter(item => item.id !== active.id);
        if (!newItems[targetDay].some(item => item.id === active.id)) {
          newItems[targetDay] = [...newItems[targetDay], sourceItem];
        }
      }

      return newItems;
    });
  };

  const handleDeleteTime = (id) => {
    setItemsByDay((prev) => {
      const newItems = {};
      for (const day in prev) {
        //newItems[day] = prev[day].filter((item) => item !== id);
        newItems[day] = prev[day].filter((item) => item.id !== id);
      }
      return newItems;
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>輸入工作的時間:</h1>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem' }}>
        <input
          type="number"
          min="0"
          max="23"
          value={startHour}
          onChange={(e) => setStartHour(e.target.value)}
          placeholder="時"
          style={{ width: '45px', padding: '0.3rem' }}
        />
        :
        <input
          type="number"
          min="0"
          max="59"
          value={startMinute}
          onChange={(e) => setStartMinute(e.target.value)}
          placeholder="分"
          style={{ width: '45px', padding: '0.3rem' }}
        />
        <span> ～ </span>
        <input
          type="number"
          min="0"
          max="23"
          value={endHour}
          onChange={(e) => setEndHour(e.target.value)}
          placeholder="時"
          style={{ width: '45px', padding: '0.3rem' }}
        />
        :
        <input
          type="number"
          min="0"
          max="59"
          value={endMinute}
          onChange={(e) => setEndMinute(e.target.value)}
          placeholder="分"
          style={{ width: '45px', padding: '0.3rem' }}
        />

        <button
          onClick={handleAddTime}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'rgb(170, 184, 171)',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          生成標籤
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {/*「已生成時間」單獨一列 */}
      <div style={{ marginBottom: '2rem' }}>
        <DroppableColumn id="已生成時間">
          {itemsByDay['已生成時間'].map((item) => (
            // <DraggableTime key={item} id={item} onDelete={handleDeleteTime}/>
            <DraggableTime key={item.id} id={item.id} label={item.label} onDelete={handleDeleteTime} />
          ))}
        </DroppableColumn>
      </div>

      {/* 星期們放一起 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {daysOfWeek
          .filter((day) => day !== '已生成時間')
          .map((day) => (
            <DroppableColumn key={day} id={day}>
              {itemsByDay[day].map((item) => (
                // <DraggableTime key={item} id={item} onDelete={handleDeleteTime}/>
                <DraggableTime key={item.id} id={item.id} label={item.label} onDelete={handleDeleteTime} />
              ))}
            </DroppableColumn>
          ))}
      </div>
    </DndContext>
  </div>
  );
}